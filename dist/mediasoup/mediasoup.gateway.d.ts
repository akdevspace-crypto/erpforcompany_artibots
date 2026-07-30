import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MediasoupService } from './mediasoup.service';
import { CommunicationService } from '../communication/communication.service';
import { JwtService } from '@nestjs/jwt';
export declare class MediasoupGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly mediasoupService;
    private readonly communicationService;
    private readonly jwtService;
    server: Server;
    private peers;
    constructor(mediasoupService: MediasoupService, communicationService: CommunicationService, jwtService: JwtService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleLeaveRoom(client: Socket): void;
    private cleanUpPeer;
    handleJoinRoom(client: Socket, data: {
        roomId: string;
        sessionId?: string;
    }): Promise<{
        rtpCapabilities: import("mediasoup/types").RtpCapabilities;
        existingProducers: string[];
    }>;
    handleCreateWebRtcTransport(client: Socket, data: {
        forceTcp?: boolean;
        producing?: boolean;
        consuming?: boolean;
        sctpCapabilities?: any;
    }): Promise<{
        id: string;
        iceParameters: import("mediasoup/types").IceParameters;
        iceCandidates: import("mediasoup/types").IceCandidate[];
        dtlsParameters: import("mediasoup/types").DtlsParameters;
    }>;
    handleConnectWebRtcTransport(client: Socket, data: {
        transportId: string;
        dtlsParameters: any;
    }): Promise<{}>;
    handleProduce(client: Socket, data: {
        transportId: string;
        kind: any;
        rtpParameters: any;
        appData: any;
    }): Promise<{
        id: string;
    }>;
    handleConsume(client: Socket, data: {
        transportId: string;
        producerId: string;
        rtpCapabilities: any;
    }): Promise<{
        id: string;
        producerId: string;
        kind: import("mediasoup/types").MediaKind;
        rtpParameters: import("mediasoup/types").RtpParameters;
        error?: undefined;
    } | {
        error: any;
        id?: undefined;
        producerId?: undefined;
        kind?: undefined;
        rtpParameters?: undefined;
    }>;
    handleResumeConsumer(client: Socket, data: {
        consumerId: string;
    }): Promise<{}>;
}
