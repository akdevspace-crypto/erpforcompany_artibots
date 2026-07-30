import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    create(createTicketDto: CreateTicketDto, req: any, file: Express.Multer.File): Promise<{
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
    findAll(req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
    updateStatus(id: string, updateTicketStatusDto: UpdateTicketStatusDto, req: any): Promise<{
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
    submitReport(id: string, body: {
        content: string;
        isCritical: boolean;
    }, req: any): Promise<{
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
