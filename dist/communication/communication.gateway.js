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
exports.CommunicationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CommunicationGateway = class CommunicationGateway {
    jwtService;
    prisma;
    server;
    logger = new common_1.Logger('CommunicationGateway');
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    connectedUsers = new Map();
    async handleConnection(client) {
        try {
            const token = client.handshake.query.token || client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);
            client.data.user = payload;
            const userId = payload.sub;
            await client.join(`user:${userId}`);
            this.logger.log(`Comm Client connected: ${userId}`);
            if (!this.connectedUsers.has(userId)) {
                this.connectedUsers.set(userId, new Set());
                this.server.emit('user:status', { userId, status: 'online' });
            }
            const userSockets = this.connectedUsers.get(userId);
            if (userSockets) {
                userSockets.add(client.id);
            }
            const employee = await this.prisma.employee.findUnique({ where: { userId: userId } });
            if (employee) {
                const memberships = await this.prisma.teamMember.findMany({ where: { employeeId: employee.id } });
                for (const m of memberships) {
                    await client.join(`team:${m.teamId}`);
                    this.logger.log(`User ${userId} joined team:${m.teamId}`);
                }
            }
        }
        catch (e) {
            this.logger.error(`Connection error: ${e.message}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.data.user?.sub;
        if (userId && this.connectedUsers.has(userId)) {
            const userSockets = this.connectedUsers.get(userId);
            if (userSockets) {
                userSockets.delete(client.id);
                if (userSockets.size === 0) {
                    this.connectedUsers.delete(userId);
                    this.server.emit('user:status', { userId, status: 'offline' });
                }
            }
        }
    }
    handleGetStatus(client) {
        const onlineUserIds = Array.from(this.connectedUsers.keys());
        return { onlineUsers: onlineUserIds };
    }
    handleJoinConversation(data, client) {
        client.join(`conversation:${data.conversationId}`);
    }
    handleLeaveConversation(data, client) {
        client.leave(`conversation:${data.conversationId}`);
    }
    handleTypingStart(data, client) {
        const userId = client.data.user.sub;
        client.to(`conversation:${data.conversationId}`).emit('typing:start', { conversationId: data.conversationId, userId });
    }
    handleTypingStop(data, client) {
        const userId = client.data.user.sub;
        client.to(`conversation:${data.conversationId}`).emit('typing:stop', { conversationId: data.conversationId, userId });
    }
    async handleCallStart(data, client) {
        const callerId = client.data.user.sub;
        this.logger.log(`[CommunicationGateway] Call start request from ${callerId} to ${data.targetUserId}`);
        this.logger.log(`[CommunicationGateway] Data: ${JSON.stringify(data)}`);
        const caller = await this.prisma.user.findUnique({
            where: { id: callerId },
            include: { employee: { select: { firstName: true, lastName: true } } }
        });
        const callerName = caller?.employee
            ? `${caller.employee.firstName} ${caller.employee.lastName}`
            : caller?.email || 'Unknown';
        const session = await this.prisma.callSession.create({
            data: {
                callerUserId: callerId,
                calleeUserId: data.targetUserId,
                status: 'RINGING',
                reason: data.reason
            }
        });
        const targetRoom = `user:${data.targetUserId}`;
        const roomSize = this.server.adapter.rooms.get(targetRoom)?.size || 0;
        this.logger.log(`Target room ${targetRoom} has ${roomSize} active sockets`);
        this.server.to(targetRoom).emit('call:incoming', {
            callerId,
            callerName,
            sessionId: session.id,
            conversationId: data.conversationId,
            reason: data.reason,
            priority: data.priority,
        });
        this.logger.log(`Emitting call:incoming to user:${data.targetUserId} with session ${session.id}`);
        return { sessionId: session.id };
    }
    async handleCallAttemptAnswer(data, client) {
        try {
            const userId = client.data.user.sub;
            const socketId = client.id;
            const result = await this.prisma.callSession.updateMany({
                where: {
                    id: data.sessionId,
                    status: 'RINGING'
                },
                data: {
                    status: 'IN_PROGRESS',
                    startedAt: new Date()
                }
            });
            if (result.count === 0) {
                client.emit('call:start_error', { message: 'Call already answered on another device.' });
                client.emit('call:handled_elsewhere', { sessionId: data.sessionId, status: 'taken' });
                return;
            }
            client.emit('call:accepted_by_you', {
                sessionId: data.sessionId,
                signalData: data.signalData
            });
            this.server.to(`user:${data.callerId}`).emit('call:accepted', {
                accepterId: userId,
                signalData: data.signalData,
                sessionId: data.sessionId
            });
            client.broadcast.to(`user:${userId}`).emit('call:handled_elsewhere', { sessionId: data.sessionId, status: 'accepted' });
        }
        catch (error) {
            this.logger.error(`Error in call:attempt_answer: ${error.message}`);
        }
    }
    async handleCallReject(data, client) {
        try {
            const result = await this.prisma.callSession.updateMany({
                where: {
                    id: data.sessionId,
                    OR: [{ status: 'RINGING' }, { status: 'IN_PROGRESS' }]
                },
                data: {
                    status: 'REJECTED',
                    endedAt: new Date()
                }
            });
            const userId = client.data.user.sub;
            const socketId = client.id;
            if (result.count > 0 || true) {
                this.server.to(`user:${data.callerId}`).emit('call:rejected', {
                    rejecterId: userId,
                    sessionId: data.sessionId
                });
            }
            const userSockets = this.connectedUsers.get(userId);
            if (userSockets) {
                userSockets.forEach(sid => {
                    if (sid !== socketId) {
                        this.server.to(sid).emit('call:handled_elsewhere', { sessionId: data.sessionId, status: 'rejected' });
                    }
                });
            }
        }
        catch (error) {
            this.logger.error(`Error in call:reject: ${error.message}`);
        }
    }
    async handleCallEnd(data, client) {
        if (data.sessionId) {
            const session = await this.prisma.callSession.findUnique({ where: { id: data.sessionId } });
            if (session && session.startedAt) {
                const now = new Date();
                const duration = Math.round((now.getTime() - new Date(session.startedAt).getTime()) / 1000);
                await this.prisma.callSession.update({
                    where: { id: data.sessionId },
                    data: { status: 'ENDED', endedAt: now, duration: duration }
                });
            }
            else {
                await this.prisma.callSession.update({
                    where: { id: data.sessionId },
                    data: { status: 'ENDED', endedAt: new Date(), duration: 0 }
                });
            }
        }
        this.server.to(`user:${data.targetUserId}`).emit('call:ended', {
            enderId: client.data.user.sub
        });
    }
    async handleTeamMessage(data, client) {
        const userId = client.data.user.sub;
        const message = await this.prisma.teamMessage.create({
            data: {
                teamId: data.teamId,
                senderUserId: userId,
                body: data.content
            },
            include: {
                sender: { include: { employee: true } }
            }
        });
        this.server.to(`team:${data.teamId}`).emit('team:new-message', {
            ...message,
            senderName: message.sender.employee
                ? `${message.sender.employee.firstName} ${message.sender.employee.lastName}`
                : message.sender.email
        });
    }
};
exports.CommunicationGateway = CommunicationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], CommunicationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('directory:get-status'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], CommunicationGateway.prototype, "handleGetStatus", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('conversation:join'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], CommunicationGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('conversation:leave'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], CommunicationGateway.prototype, "handleLeaveConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:start'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], CommunicationGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:stop'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], CommunicationGateway.prototype, "handleTypingStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call:start'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], CommunicationGateway.prototype, "handleCallStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call:attempt_answer'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], CommunicationGateway.prototype, "handleCallAttemptAnswer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call:reject'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], CommunicationGateway.prototype, "handleCallReject", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('call:end'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], CommunicationGateway.prototype, "handleCallEnd", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('team:send-message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], CommunicationGateway.prototype, "handleTeamMessage", null);
exports.CommunicationGateway = CommunicationGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: ["http://localhost:5173", "http://localhost:3000/"],
            credentials: true
        },
        namespace: '/communication'
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], CommunicationGateway);
//# sourceMappingURL=communication.gateway.js.map