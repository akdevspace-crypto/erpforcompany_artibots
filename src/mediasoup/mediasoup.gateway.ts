import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MediasoupService } from './mediasoup.service';
import { CommunicationService } from '../communication/communication.service';
import { config } from './mediasoup.config';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: '/mediasoup',
})
export class MediasoupGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // Map to store transports, producers, consumers associated with a socket
    private peers = new Map<string, { roomId: string; transports: string[]; producers: string[]; consumers: string[]; userId?: string; sessionId?: string }>();

    constructor(
        private readonly mediasoupService: MediasoupService,
        private readonly communicationService: CommunicationService,
        private readonly jwtService: JwtService
    ) { }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        const token = client.handshake.query.token as string;
        if (token) {
            try {
                this.jwtService.verify(token);
                // Valid token, we'll extract userId in joinRoom or when needed
            } catch (e) {
                console.error('Invalid token for mediasoup connection');
                client.disconnect();
            }
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.cleanUpPeer(client.id);
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(@ConnectedSocket() client: Socket) {
        console.log(`Client left room: ${client.id}`);
        this.cleanUpPeer(client.id);
    }

    private async cleanUpPeer(socketId: string) {
        const fs = require('fs');
        const log = (msg) => fs.appendFileSync('debug_recording.log', `[Gateway] ${new Date().toISOString()} ${msg}\n`);

        const peer = this.peers.get(socketId);
        if (!peer) return;

        log(`cleanUpPeer for socket ${socketId}, user ${peer.userId}, session ${peer.sessionId}`);

        // Try to identify user
        const userId = peer.userId;

        // Stop all recordings for this peer's producers
        for (const producerId of peer.producers) {
            log(`Stopping recording for producer ${producerId}`);
            const recordingPath = await this.mediasoupService.stopRecording(producerId);
            if (recordingPath) {
                console.log(`Recording stopped for ${producerId}: ${recordingPath}`);
                log(`Recording stopped, path: ${recordingPath}`);

                if (userId) {
                    // Normalize path to store only relative path 'uploads/recordings/filename'
                    const path = require('path');
                    const relativePath = recordingPath.split(path.sep).pop(); // Get filename
                    const finalPath = `uploads/recordings/${relativePath}`;

                    await this.communicationService.saveCallRecording(userId, finalPath, peer.sessionId);
                } else {
                    console.warn(`[MediasoupGateway] No userId found for peer ${socketId}, cannot link recording.`);
                    log(`No userId found!`);
                }
            } else {
                log(`stopRecording returned null (failed)`);
            }
        }

        this.peers.delete(socketId);
    }

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string, sessionId?: string },
    ) {
        const { roomId, sessionId } = data;
        const router = await this.mediasoupService.createRouter(roomId);

        // Extract userId from token
        let userId: string | undefined;
        const token = client.handshake.query.token as string;
        if (token) {
            try {
                const decoded = this.jwtService.verify(token);
                userId = decoded.sub;
            } catch (e) {
                console.warn('Invalid token during joinRoom');
            }
        }

        this.peers.set(client.id, {
            roomId,
            transports: [],
            producers: [],
            consumers: [],
            userId,
            sessionId // Store sessionId
        });

        client.join(roomId);

        const existingProducers: string[] = [];
        for (const peer of this.peers.values()) {
            if (peer.roomId === roomId && peer.producers.length > 0) {
                existingProducers.push(...peer.producers);
            }
        }

        return {
            rtpCapabilities: router.rtpCapabilities,
            existingProducers,
        };
    }

    @SubscribeMessage('createWebRtcTransport')
    async handleCreateWebRtcTransport(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { forceTcp?: boolean; producing?: boolean; consuming?: boolean; sctpCapabilities?: any },
    ) {
        const peer = this.peers.get(client.id);
        if (!peer) throw new Error('Peer not found');

        const router = this.mediasoupService.getRouter(peer.roomId);
        if (!router) throw new Error('Router not found');

        const transport = await router.createWebRtcTransport({
            listenIps: config.mediasoup.webRtcTransport.listenIps,
            enableUdp: !data.forceTcp,
            enableTcp: true,
            initialAvailableOutgoingBitrate: config.mediasoup.webRtcTransport.initialAvailableOutgoingBitrate,
        });

        peer.transports.push(transport.id);
        this.mediasoupService.addTransport(transport);

        return {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
        };
    }

    @SubscribeMessage('connectWebRtcTransport')
    async handleConnectWebRtcTransport(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { transportId: string; dtlsParameters: any },
    ) {
        const transport = this.mediasoupService.getTransport(data.transportId);
        if (!transport) throw new Error('Transport not found');
        await transport.connect({ dtlsParameters: data.dtlsParameters });
        return {};
    }

    @SubscribeMessage('produce')
    async handleProduce(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { transportId: string; kind: any; rtpParameters: any; appData: any },
    ) {
        const transport = this.mediasoupService.getTransport(data.transportId);
        if (!transport) throw new Error('Transport not found');

        const peer = this.peers.get(client.id);
        if (peer && data.kind === 'audio') {
            // Find existing audio producers for this peer and close them
            const audioProducers = peer.producers.filter(pid => {
                const p = this.mediasoupService.getProducer(pid);
                return p && p.kind === 'audio';
            });

            for (const pid of audioProducers) {
                console.log(`[MediasoupGateway] Closing existing audio producer ${pid} for peer ${client.id}`);

                // 1. Stop Recording
                await this.mediasoupService.stopRecording(pid);

                // 2. Close Producer
                const p = this.mediasoupService.getProducer(pid);
                if (p) p.close();

                // 3. Remove from maps (mediasoupService probably handles this partially via observer, but manual cleanup is safer)
                // Actually MediasoupService stores them in a map, we need to remove them?
                // The service.addProducer just sets it. We don't have removeProducer public.
                // But producer.close() triggers 'transportclose' etc.

                // Remove from peer list
                peer.producers = peer.producers.filter(id => id !== pid);
            }
        }

        const producer = await transport.produce({
            kind: data.kind,
            rtpParameters: data.rtpParameters,
            appData: { ...data.appData, socketId: client.id },
        });

        if (peer) {
            peer.producers.push(producer.id);
            client.broadcast.to(peer.roomId).emit('newProducer', { producerId: producer.id });

            if (data.kind === 'audio') {
                console.log(`Audio producer created: ${producer.id}. Starting recording...`);
                this.mediasoupService.startRecording(peer.roomId, producer.id)
                    .then(path => {
                        if (path) console.log(`Recording started at ${path}`);
                    })
                    .catch(err => console.error('Failed to start recording', err));
            }
        }
        this.mediasoupService.addProducer(producer);

        return { id: producer.id };

    }

    @SubscribeMessage('consume')
    async handleConsume(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { transportId: string; producerId: string; rtpCapabilities: any },
    ) {
        try {
            const transport = this.mediasoupService.getTransport(data.transportId);
            if (!transport) throw new Error('Transport not found');

            const router = this.mediasoupService.getRouter(this.peers.get(client.id)?.roomId || '');
            if (!router) throw new Error('Router not found');

            if (!router.canConsume({ producerId: data.producerId, rtpCapabilities: data.rtpCapabilities })) {
                throw new Error('Cannot consume');
            }

            const consumer = await transport.consume({
                producerId: data.producerId,
                rtpCapabilities: data.rtpCapabilities,
                paused: true,
            });

            const peer = this.peers.get(client.id);
            if (peer) peer.consumers.push(consumer.id);

            this.mediasoupService.addConsumer(consumer);

            return {
                id: consumer.id,
                producerId: data.producerId,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
            };
        } catch (error: any) {
            console.error('Error in handleConsume:', error);
            return { error: error.message || 'Unknown error during consumption' };
        }
    }

    @SubscribeMessage('resumeConsumer')
    async handleResumeConsumer(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { consumerId: string },
    ) {
        // Logic would go here to find consumer and call resume()
        // For mvp, we can assume client calls resume on consumer immediately
        const consumer = this.mediasoupService.getConsumer(data.consumerId);
        if (consumer) await consumer.resume();
        return {};
    }
}
