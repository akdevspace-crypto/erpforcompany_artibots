import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class CommunicationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private prisma;
    server: Server;
    private logger;
    constructor(jwtService: JwtService, prisma: PrismaService);
    private connectedUsers;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleGetStatus(client: Socket): {
        onlineUsers: string[];
    };
    handleJoinConversation(data: {
        conversationId: string;
    }, client: Socket): void;
    handleLeaveConversation(data: {
        conversationId: string;
    }, client: Socket): void;
    handleTypingStart(data: {
        conversationId: string;
    }, client: Socket): void;
    handleTypingStop(data: {
        conversationId: string;
    }, client: Socket): void;
    handleCallStart(data: {
        targetUserId: string;
        conversationId: string;
        reason: string;
        priority?: string;
    }, client: Socket): Promise<{
        sessionId: string;
    }>;
    handleCallAttemptAnswer(data: {
        callerId: string;
        sessionId: string;
        signalData: any;
    }, client: Socket): Promise<void>;
    handleCallReject(data: {
        callerId: string;
        sessionId: string;
    }, client: Socket): Promise<void>;
    handleCallEnd(data: {
        targetUserId: string;
        sessionId: string;
    }, client: Socket): Promise<void>;
    handleTeamMessage(data: {
        teamId: string;
        content: string;
    }, client: Socket): Promise<void>;
}
