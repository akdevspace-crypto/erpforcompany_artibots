import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
export declare class MeetingsService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    create(createMeetingDto: CreateMeetingDto, creatorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        title: string;
        description: string | null;
        scheduledAt: Date;
        duration: number;
    }>;
    findAll(date?: string): Promise<({
        attendees: ({
            employee: {
                firstName: string;
                lastName: string;
                jobTitle: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            employeeId: string;
            meetingId: string;
            attended: boolean;
            reportSubmitted: boolean;
            joinedAt: Date | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        title: string;
        description: string | null;
        scheduledAt: Date;
        duration: number;
    })[]>;
    findOne(id: string): Promise<({
        attendees: ({
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
            };
        } & {
            id: string;
            createdAt: Date;
            employeeId: string;
            meetingId: string;
            attended: boolean;
            reportSubmitted: boolean;
            joinedAt: Date | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        title: string;
        description: string | null;
        scheduledAt: Date;
        duration: number;
    }) | null>;
}
