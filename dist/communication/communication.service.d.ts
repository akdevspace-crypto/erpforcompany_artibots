import { PrismaService } from '../prisma/prisma.service';
import { CommunicationGateway } from './communication.gateway';
import { CreateCallDto } from './dto/create-call.dto';
export declare class CommunicationService {
    private prisma;
    private gateway;
    constructor(prisma: PrismaService, gateway: CommunicationGateway);
    getDirectory(currentUser: any, query?: string): Promise<{
        userId: string;
        displayName: string;
        role: import(".prisma/client").$Enums.Role;
        departmentName: string | undefined;
        jobTitle: string | null | undefined;
        avatarInitial: string;
    }[]>;
    getConversations(userId: string): Promise<{
        id: string;
        otherUser: {
            userId: string;
            displayName: string;
        } | null;
        lastMessage: {
            body: string;
            createdAt: Date;
            senderId: string;
        } | null;
        isUnread: boolean;
        updatedAt: Date;
    }[]>;
    startConversation(userId: string, targetUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    sendMessage(conversationId: string, userId: string, dto: any): Promise<{
        sender: {
            employee: {
                firstName: string;
                lastName: string;
                gender: import(".prisma/client").$Enums.Gender;
                phone: string | null;
                address: string | null;
                emergencyContact: string | null;
                permanentAddress: string | null;
                jobTitle: string | null;
                salary: number | null;
                joinDate: Date | null;
                dob: Date | null;
                bloodGroup: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                managerId: string | null;
                shiftEndTime: string | null;
            } | null;
        } & {
            email: string;
            password: string;
            departmentId: string | null;
            id: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
            profileImage: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        fileUrl: string | null;
        storedFileId: string | null;
        senderUserId: string;
        body: string;
        conversationId: string;
        fileType: string | null;
        readAt: Date | null;
        isEdited: boolean;
        editedAt: Date | null;
    }>;
    updateMessage(messageId: string, userId: string, newContent: string): Promise<{
        sender: {
            employee: {
                firstName: string;
                lastName: string;
                gender: import(".prisma/client").$Enums.Gender;
                phone: string | null;
                address: string | null;
                emergencyContact: string | null;
                permanentAddress: string | null;
                jobTitle: string | null;
                salary: number | null;
                joinDate: Date | null;
                dob: Date | null;
                bloodGroup: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                managerId: string | null;
                shiftEndTime: string | null;
            } | null;
        } & {
            email: string;
            password: string;
            departmentId: string | null;
            id: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
            profileImage: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        fileUrl: string | null;
        storedFileId: string | null;
        senderUserId: string;
        body: string;
        conversationId: string;
        fileType: string | null;
        readAt: Date | null;
        isEdited: boolean;
        editedAt: Date | null;
    }>;
    getMessages(conversationId: string, userId: string): Promise<any[]>;
    getCallHistory(userId: string): Promise<({
        caller: {
            employee: {
                firstName: string;
                lastName: string;
            } | null;
            email: string;
            id: string;
        };
        callee: {
            employee: {
                firstName: string;
                lastName: string;
            } | null;
            email: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.CallStatus;
        reason: string | null;
        duration: number | null;
        calleeUserId: string;
        callerUserId: string;
        startedAt: Date | null;
        endedAt: Date | null;
        recordingUrl: string | null;
        conversationId: string | null;
    })[]>;
    getAllCallHistory(): Promise<({
        caller: {
            employee: {
                firstName: string;
                lastName: string;
            } | null;
            email: string;
            id: string;
        };
        callee: {
            employee: {
                firstName: string;
                lastName: string;
            } | null;
            email: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.CallStatus;
        reason: string | null;
        duration: number | null;
        calleeUserId: string;
        callerUserId: string;
        startedAt: Date | null;
        endedAt: Date | null;
        recordingUrl: string | null;
        conversationId: string | null;
    })[]>;
    createCallSession(callerId: string, dto: CreateCallDto): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.CallStatus;
        reason: string | null;
        duration: number | null;
        calleeUserId: string;
        callerUserId: string;
        startedAt: Date | null;
        endedAt: Date | null;
        recordingUrl: string | null;
        conversationId: string | null;
    }>;
    deleteCallSession(id: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.CallStatus;
        reason: string | null;
        duration: number | null;
        calleeUserId: string;
        callerUserId: string;
        startedAt: Date | null;
        endedAt: Date | null;
        recordingUrl: string | null;
        conversationId: string | null;
    }>;
    saveCallRecording(userId: string, recordingPath: string, sessionId?: string): Promise<void>;
}
