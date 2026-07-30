import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class TicketsService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    create(dto: CreateTicketDto, userId: string, attachmentUrl?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        category: string;
        description: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: string;
        subject: string;
        attachmentUrl: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
    }>;
    submitReport(ticketId: string, content: string, isCritical: boolean, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        category: string;
        description: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: string;
        subject: string;
        attachmentUrl: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        category: string;
        description: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: string;
        subject: string;
        attachmentUrl: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
    }>;
    findAll(user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        category: string;
        description: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: string;
        subject: string;
        attachmentUrl: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
    }[] | undefined>;
    updateStatus(id: string, dto: UpdateTicketStatusDto, user: any): Promise<{
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
        updatedAt: Date;
        employeeId: string;
        category: string;
        description: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: string;
        subject: string;
        attachmentUrl: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
    }>;
    private getAdminsForDepartment;
    getLegalStats(): Promise<{
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        tickets: ({
            employee: {
                user: {
                    department: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        name: string;
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
            updatedAt: Date;
            employeeId: string;
            category: string;
            description: string;
            status: import(".prisma/client").$Enums.TicketStatus;
            priority: string;
            subject: string;
            attachmentUrl: string | null;
            resolution: string | null;
            resolvedAt: Date | null;
            resolvedByUserId: string | null;
        })[];
    }>;
    getLegalReports(): Promise<({
        employee: {
            user: {
                department: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
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
        resolvedBy: {
            email: string;
            role: import(".prisma/client").$Enums.Role;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        category: string;
        description: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        priority: string;
        subject: string;
        attachmentUrl: string | null;
        resolution: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
    })[]>;
}
