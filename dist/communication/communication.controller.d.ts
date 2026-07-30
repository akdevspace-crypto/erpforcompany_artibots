import { CommunicationService } from './communication.service';
import { FilesService } from '../files/files.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateCallDto } from './dto/create-call.dto';
export declare class CommunicationController {
    private readonly communicationService;
    private readonly filesService;
    constructor(communicationService: CommunicationService, filesService: FilesService);
    getDirectory(req: any, query: string): Promise<{
        userId: string;
        displayName: string;
        role: import(".prisma/client").$Enums.Role;
        departmentName: string | undefined;
        jobTitle: string | null | undefined;
        avatarInitial: string;
    }[]>;
    getConversations(req: any): Promise<{
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
    startConversation(req: any, dto: CreateConversationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMessages(req: any, id: string): Promise<any[]>;
    sendMessage(req: any, id: string, dto: SendMessageDto, file: Express.Multer.File): Promise<{
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
    editMessage(req: any, id: string, body: {
        content: string;
    }): Promise<{
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
    getCallHistory(req: any): Promise<({
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
    deleteCallSession(req: any, id: string): Promise<{
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
    getAllCallHistory(req: any): Promise<({
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
    createCallSession(req: any, dto: CreateCallDto): Promise<{
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
}
