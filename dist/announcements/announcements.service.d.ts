import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
export declare class AnnouncementsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateAnnouncementDto, creator: any): Promise<{
        departmentId: string | null;
        id: string;
        createdAt: Date;
        title: string;
        createdByUserId: string;
        body: string;
        mediaUrl: string | null;
        mediaType: string | null;
    }>;
    findAll(user: any): Promise<({
        createdBy: {
            employee: {
                firstName: string;
                lastName: string;
            } | null;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        departmentId: string | null;
        id: string;
        createdAt: Date;
        title: string;
        createdByUserId: string;
        body: string;
        mediaUrl: string | null;
        mediaType: string | null;
    })[]>;
    update(id: string, data: any): Promise<{
        departmentId: string | null;
        id: string;
        createdAt: Date;
        title: string;
        createdByUserId: string;
        body: string;
        mediaUrl: string | null;
        mediaType: string | null;
    }>;
    remove(id: string): Promise<{
        departmentId: string | null;
        id: string;
        createdAt: Date;
        title: string;
        createdByUserId: string;
        body: string;
        mediaUrl: string | null;
        mediaType: string | null;
    }>;
}
