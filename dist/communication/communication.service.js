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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const communication_gateway_1 = require("./communication.gateway");
let CommunicationService = class CommunicationService {
    prisma;
    gateway;
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async getDirectory(currentUser, query) {
        const where = {};
        if (query) {
            where.OR = [
                { employee: { firstName: { contains: query, mode: 'insensitive' } } },
                { employee: { lastName: { contains: query, mode: 'insensitive' } } },
                { employee: { jobTitle: { contains: query, mode: 'insensitive' } } },
            ];
        }
        where.id = { not: currentUser.id };
        const users = await this.prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                role: true,
                department: { select: { id: true, name: true } },
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                        jobTitle: true,
                    }
                }
            }
        });
        return users.map(u => ({
            userId: u.id,
            displayName: u.employee ? `${u.employee.firstName} ${u.employee.lastName}` : u.email,
            role: u.role,
            departmentName: u.department?.name,
            jobTitle: u.employee?.jobTitle,
            avatarInitial: u.employee?.firstName?.[0] || u.email[0]
        }));
    }
    async getConversations(userId) {
        const conversations = await this.prisma.conversation.findMany({
            where: {
                participants: {
                    some: { userId: userId }
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            include: {
                                employee: { select: { firstName: true, lastName: true } }
                            }
                        }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
        return conversations.map(c => {
            const otherParticipant = c.participants.find(p => p.userId !== userId);
            const myParticipant = c.participants.find(p => p.userId === userId);
            const lastMsg = c.messages[0];
            const isUnread = lastMsg && myParticipant ? lastMsg.createdAt > myParticipant.lastReadAt : false;
            return {
                id: c.id,
                otherUser: otherParticipant ? {
                    userId: otherParticipant.userId,
                    displayName: otherParticipant.user.employee
                        ? `${otherParticipant.user.employee.firstName} ${otherParticipant.user.employee.lastName}`
                        : otherParticipant.user.email,
                } : null,
                lastMessage: lastMsg ? {
                    body: lastMsg.body,
                    createdAt: lastMsg.createdAt,
                    senderId: lastMsg.senderUserId
                } : null,
                isUnread,
                updatedAt: c.updatedAt
            };
        });
    }
    async startConversation(userId, targetUserId) {
        const userConversations = await this.prisma.conversation.findMany({
            where: {
                participants: { some: { userId } }
            },
            include: { participants: true }
        });
        const existing = userConversations.find(c => c.participants.some(p => p.userId === targetUserId));
        if (existing)
            return existing;
        return this.prisma.conversation.create({
            data: {
                participants: {
                    create: [
                        { userId: userId },
                        { userId: targetUserId }
                    ]
                }
            }
        });
    }
    async sendMessage(conversationId, userId, dto) {
        const participant = await this.prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: { conversationId, userId }
            }
        });
        if (!participant)
            throw new common_1.ForbiddenException('You are not in this conversation');
        const message = await this.prisma.message.create({
            data: {
                conversationId,
                senderUserId: userId,
                body: dto.content || '',
                fileUrl: dto.fileUrl,
                fileType: dto.fileType,
                storedFileId: dto.storedFileId
            },
            include: { sender: { include: { employee: true } } }
        });
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });
        const participants = await this.prisma.conversationParticipant.findMany({
            where: { conversationId },
            select: { userId: true }
        });
        participants.forEach(p => {
            const msg = message;
            let fileUrl = msg.fileUrl;
            if (fileUrl && !fileUrl.startsWith('http')) {
                const supabaseUrl = process.env.SUPABASE_URL || 'https://wqqpafsisdnsgpwipyqg.supabase.co';
                fileUrl = `${supabaseUrl}/storage/v1/object/public/project-files/${fileUrl}`;
            }
            this.gateway.server.to(`user:${p.userId}`).emit('dm:new-message', {
                conversationId,
                id: msg.id,
                body: msg.body,
                fileUrl: fileUrl,
                fileType: msg.fileType,
                createdAt: msg.createdAt,
                senderUserId: msg.senderUserId,
                senderName: msg.sender.employee ? `${msg.sender.employee.firstName} ${msg.sender.employee.lastName}` : msg.sender.email,
                localId: dto.localId
            });
        });
        return message;
    }
    async updateMessage(messageId, userId, newContent) {
        const message = await this.prisma.message.findUnique({
            where: { id: messageId },
            include: { sender: true }
        });
        if (!message)
            throw new common_1.NotFoundException('Message not found');
        if (message.senderUserId !== userId)
            throw new common_1.ForbiddenException('You can only edit your own messages');
        await this.prisma.messageEditHistory.create({
            data: {
                messageId: message.id,
                oldBody: message.body
            }
        });
        const updatedMessage = await this.prisma.message.update({
            where: { id: messageId },
            data: {
                body: newContent,
                isEdited: true,
                editedAt: new Date()
            },
            include: { sender: { include: { employee: true } } }
        });
        const participants = await this.prisma.conversationParticipant.findMany({
            where: { conversationId: message.conversationId },
            select: { userId: true }
        });
        participants.forEach(p => {
            this.gateway.server.to(`user:${p.userId}`).emit('message:updated', {
                conversationId: message.conversationId,
                id: updatedMessage.id,
                body: updatedMessage.body,
                isEdited: true,
                editedAt: updatedMessage.editedAt
            });
        });
        return updatedMessage;
    }
    async getMessages(conversationId, userId) {
        const participant = await this.prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: { conversationId, userId }
            }
        });
        if (!participant)
            throw new common_1.ForbiddenException('Access denied');
        const previousLastReadAt = participant.lastReadAt || new Date(0);
        await this.prisma.conversationParticipant.update({
            where: { conversationId_userId: { conversationId, userId } },
            data: { lastReadAt: new Date() }
        });
        const messages = await this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, email: true, employee: { select: { firstName: true, lastName: true } } } } }
        });
        return messages.map(m => {
            const msg = m;
            let fileUrl = msg.fileUrl;
            if (fileUrl && !fileUrl.startsWith('http')) {
                const supabaseUrl = process.env.SUPABASE_URL || 'https://wqqpafsisdnsgpwipyqg.supabase.co';
                fileUrl = `${supabaseUrl}/storage/v1/object/public/project-files/${fileUrl}`;
            }
            return {
                ...msg,
                fileUrl,
                isUnread: new Date(m.createdAt).getTime() > previousLastReadAt.getTime() && m.senderUserId !== userId
            };
        });
    }
    async getCallHistory(userId) {
        return this.prisma.callSession.findMany({
            where: {
                OR: [
                    { callerUserId: userId },
                    { calleeUserId: userId }
                ]
            },
            include: {
                caller: { select: { id: true, email: true, employee: { select: { firstName: true, lastName: true } } } },
                callee: { select: { id: true, email: true, employee: { select: { firstName: true, lastName: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        }).then(sessions => sessions.map(session => {
            if (session.duration === 0 && session.startedAt && session.endedAt) {
                const duration = Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000);
                return { ...session, duration };
            }
            return session;
        }));
    }
    async getAllCallHistory() {
        return this.prisma.callSession.findMany({
            include: {
                caller: { select: { id: true, email: true, employee: { select: { firstName: true, lastName: true } } } },
                callee: { select: { id: true, email: true, employee: { select: { firstName: true, lastName: true } } } }
            },
            orderBy: { createdAt: 'desc' },
            where: {}
        });
    }
    async createCallSession(callerId, dto) {
        return this.prisma.callSession.create({
            data: {
                callerUserId: callerId,
                calleeUserId: dto.calleeId,
                reason: dto.reason,
                status: 'RINGING'
            }
        });
    }
    async deleteCallSession(id) {
        const call = await this.prisma.callSession.findUnique({ where: { id } });
        if (!call)
            throw new common_1.NotFoundException('Call record not found');
        try {
            return await this.prisma.callSession.delete({
                where: { id }
            });
        }
        catch (error) {
            console.error('Failed to delete call session', error);
            throw new common_1.InternalServerErrorException('Failed to delete call record');
        }
    }
    async saveCallRecording(userId, recordingPath, sessionId) {
        const fs = require('fs');
        const log = (msg) => fs.appendFileSync('debug_recording.log', `[Communication] ${new Date().toISOString()} ${msg}\n`);
        log(`saveCallRecording called for user ${userId}, session ${sessionId}, path ${recordingPath}`);
        let lastCall;
        if (sessionId) {
            lastCall = await this.prisma.callSession.findUnique({ where: { id: sessionId } });
            log(`Values found with sessionId: ${!!lastCall}`);
        }
        if (!lastCall) {
            log(`Falling back to recent call lookup for user ${userId}`);
            lastCall = await this.prisma.callSession.findFirst({
                where: {
                    OR: [
                        { callerUserId: userId },
                        { calleeUserId: userId }
                    ]
                },
                orderBy: { createdAt: 'desc' }
            });
            log(`Values found with fallback: ${!!lastCall}`);
        }
        if (lastCall) {
            log(`Updating call ${lastCall.id} with recording`);
            const newUrl = lastCall.recordingUrl ? `${lastCall.recordingUrl},${recordingPath}` : recordingPath;
            try {
                await this.prisma.callSession.update({
                    where: { id: lastCall.id },
                    data: { recordingUrl: newUrl }
                });
                log(`Successfully updated call ${lastCall.id}`);
                console.log(`[CommunicationService] Linked recording ${recordingPath} to call ${lastCall.id}`);
            }
            catch (e) {
                log(`Error updating call: ${e.message}`);
                console.error(e);
            }
        }
        else {
            log(`No call found to link!`);
            console.warn(`[CommunicationService] No call found to link recording ${recordingPath}`);
        }
    }
};
exports.CommunicationService = CommunicationService;
exports.CommunicationService = CommunicationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        communication_gateway_1.CommunicationGateway])
], CommunicationService);
//# sourceMappingURL=communication.service.js.map