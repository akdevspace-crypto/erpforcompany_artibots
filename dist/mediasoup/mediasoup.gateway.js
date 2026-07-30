"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediasoupGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const mediasoup_service_1 = require("./mediasoup.service");
const communication_service_1 = require("../communication/communication.service");
const mediasoup_config_1 = require("./mediasoup.config");
const jwt_1 = require("@nestjs/jwt");
let MediasoupGateway = class MediasoupGateway {
    mediasoupService;
    communicationService;
    jwtService;
    server;
    peers = new Map();
    constructor(mediasoupService, communicationService, jwtService) {
        this.mediasoupService = mediasoupService;
        this.communicationService = communicationService;
        this.jwtService = jwtService;
    }
    handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
        const token = client.handshake.query.token;
        if (token) {
            try {
                this.jwtService.verify(token);
            }
            catch (e) {
                console.error('Invalid token for mediasoup connection');
                client.disconnect();
            }
        }
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
        this.cleanUpPeer(client.id);
    }
    handleLeaveRoom(client) {
        console.log(`Client left room: ${client.id}`);
        this.cleanUpPeer(client.id);
    }
    async cleanUpPeer(socketId) {
        const fs = require('fs');
        const log = (msg) => fs.appendFileSync('debug_recording.log', `[Gateway] ${new Date().toISOString()} ${msg}\n`);
        const peer = this.peers.get(socketId);
        if (!peer)
            return;
        log(`cleanUpPeer for socket ${socketId}, user ${peer.userId}, session ${peer.sessionId}`);
        const userId = peer.userId;
        for (const producerId of peer.producers) {
            log(`Stopping recording for producer ${producerId}`);
            const recordingPath = await this.mediasoupService.stopRecording(producerId);
            if (recordingPath) {
                console.log(`Recording stopped for ${producerId}: ${recordingPath}`);
                log(`Recording stopped, path: ${recordingPath}`);
                if (userId) {
                    const path = require('path');
                    const relativePath = recordingPath.split(path.sep).pop();
                    const finalPath = `uploads/recordings/${relativePath}`;
                    await this.communicationService.saveCallRecording(userId, finalPath, peer.sessionId);
                }
                else {
                    console.warn(`[MediasoupGateway] No userId found for peer ${socketId}, cannot link recording.`);
                    log(`No userId found!`);
                }
            }
            else {
                log(`stopRecording returned null (failed)`);
            }
        }
        this.peers.delete(socketId);
    }
    async handleJoinRoom(client, data) {
        const { roomId, sessionId } = data;
        const router = await this.mediasoupService.createRouter(roomId);
        let userId;
        const token = client.handshake.query.token;
        if (token) {
            try {
                const decoded = this.jwtService.verify(token);
                userId = decoded.sub;
            }
            catch (e) {
                console.warn('Invalid token during joinRoom');
            }
        }
        this.peers.set(client.id, {
            roomId,
            transports: [],
            producers: [],
            consumers: [],
            userId,
            sessionId
        });
        client.join(roomId);
        const existingProducers = [];
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
    async handleCreateWebRtcTransport(client, data) {
        const peer = this.peers.get(client.id);
        if (!peer)
            throw new Error('Peer not found');
        const router = this.mediasoupService.getRouter(peer.roomId);
        if (!router)
            throw new Error('Router not found');
        const transport = await router.createWebRtcTransport({
            listenIps: mediasoup_config_1.config.mediasoup.webRtcTransport.listenIps,
            enableUdp: !data.forceTcp,
            enableTcp: true,
            initialAvailableOutgoingBitrate: mediasoup_config_1.config.mediasoup.webRtcTransport.initialAvailableOutgoingBitrate,
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
    async handleConnectWebRtcTransport(client, data) {
        const transport = this.mediasoupService.getTransport(data.transportId);
        if (!transport)
            throw new Error('Transport not found');
        await transport.connect({ dtlsParameters: data.dtlsParameters });
        return {};
    }
    async handleProduce(client, data) {
        const transport = this.mediasoupService.getTransport(data.transportId);
        if (!transport)
            throw new Error('Transport not found');
        const peer = this.peers.get(client.id);
        if (peer && data.kind === 'audio') {
            const audioProducers = peer.producers.filter(pid => {
                const p = this.mediasoupService.getProducer(pid);
                return p && p.kind === 'audio';
            });
            for (const pid of audioProducers) {
                console.log(`[MediasoupGateway] Closing existing audio producer ${pid} for peer ${client.id}`);
                await this.mediasoupService.stopRecording(pid);
                const p = this.mediasoupService.getProducer(pid);
                if (p)
                    p.close();
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
                    if (path)
                        console.log(`Recording started at ${path}`);
                })
                    .catch(err => console.error('Failed to start recording', err));
            }
        }
        this.mediasoupService.addProducer(producer);
        return { id: producer.id };
    }
    async handleConsume(client, data) {
        try {
            const transport = this.mediasoupService.getTransport(data.transportId);
            if (!transport)
                throw new Error('Transport not found');
            const router = this.mediasoupService.getRouter(this.peers.get(client.id)?.roomId || '');
            if (!router)
                throw new Error('Router not found');
            if (!router.canConsume({ producerId: data.producerId, rtpCapabilities: data.rtpCapabilities })) {
                throw new Error('Cannot consume');
            }
            const consumer = await transport.consume({
                producerId: data.producerId,
                rtpCapabilities: data.rtpCapabilities,
                paused: true,
            });
            const peer = this.peers.get(client.id);
            if (peer)
                peer.consumers.push(consumer.id);
            this.mediasoupService.addConsumer(consumer);
            return {
                id: consumer.id,
                producerId: data.producerId,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
            };
        }
        catch (error) {
            console.error('Error in handleConsume:', error);
            return { error: error.message || 'Unknown error during consumption' };
        }
    }
    async handleResumeConsumer(client, data) {
        const consumer = this.mediasoupService.getConsumer(data.consumerId);
        if (consumer)
            await consumer.resume();
        return {};
    }
};
exports.MediasoupGateway = MediasoupGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MediasoupGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], MediasoupGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MediasoupGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('createWebRtcTransport'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MediasoupGateway.prototype, "handleCreateWebRtcTransport", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('connectWebRtcTransport'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MediasoupGateway.prototype, "handleConnectWebRtcTransport", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('produce'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MediasoupGateway.prototype, "handleProduce", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('consume'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MediasoupGateway.prototype, "handleConsume", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('resumeConsumer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MediasoupGateway.prototype, "handleResumeConsumer", null);
exports.MediasoupGateway = MediasoupGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/mediasoup',
    }),
    __metadata("design:paramtypes", [mediasoup_service_1.MediasoupService,
        communication_service_1.CommunicationService,
        jwt_1.JwtService])
], MediasoupGateway);
//# sourceMappingURL=mediasoup.gateway.js.map