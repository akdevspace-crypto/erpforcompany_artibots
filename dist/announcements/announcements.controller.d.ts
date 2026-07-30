import { AnnouncementsService } from './announcements.service';
import { FilesService } from '../files/files.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
export declare class AnnouncementsController {
    private readonly announcementsService;
    private readonly filesService;
    constructor(announcementsService: AnnouncementsService, filesService: FilesService);
    create(createAnnouncementDto: CreateAnnouncementDto, req: any, file: Express.Multer.File): Promise<{
        departmentId: string | null;
        id: string;
        createdAt: Date;
        title: string;
        createdByUserId: string;
        body: string;
        mediaUrl: string | null;
        mediaType: string | null;
    }>;
    findAll(req: any): Promise<({
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
    update(id: string, updateAnnouncementDto: any, req: any, file: Express.Multer.File): Promise<{
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
