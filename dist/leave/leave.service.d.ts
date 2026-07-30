import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class LeaveService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    findMe(userId: string): Promise<({
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
    } & {
        departmentId: string;
        id: string;
        type: string;
        employeeId: string;
        status: import(".prisma/client").$Enums.LeaveStatus;
        reason: string | null;
        startDate: Date;
        endDate: Date;
        isAutoApproved: boolean;
        requestedAt: Date;
        respondedAt: Date | null;
        respondedBy: string | null;
    })[]>;
    findAll(user: any): Promise<({
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
        employee: {
            user: {
                email: string;
                password: string;
                departmentId: string | null;
                id: string;
                role: import(".prisma/client").$Enums.Role;
                createdAt: Date;
                updatedAt: Date;
                profileImage: string | null;
            };
            leaveBalances: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                type: string;
                employeeId: string;
                year: number;
                total: number;
                used: number;
                remaining: number;
            }[];
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
        departmentId: string;
        id: string;
        type: string;
        employeeId: string;
        status: import(".prisma/client").$Enums.LeaveStatus;
        reason: string | null;
        startDate: Date;
        endDate: Date;
        isAutoApproved: boolean;
        requestedAt: Date;
        respondedAt: Date | null;
        respondedBy: string | null;
    })[]>;
    create(dto: any, userId: string): Promise<{
        departmentId: string;
        id: string;
        type: string;
        employeeId: string;
        status: import(".prisma/client").$Enums.LeaveStatus;
        reason: string | null;
        startDate: Date;
        endDate: Date;
        isAutoApproved: boolean;
        requestedAt: Date;
        respondedAt: Date | null;
        respondedBy: string | null;
    }>;
    updateStatus(id: string, status: string, user: any): Promise<{
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
        departmentId: string;
        id: string;
        type: string;
        employeeId: string;
        status: import(".prisma/client").$Enums.LeaveStatus;
        reason: string | null;
        startDate: Date;
        endDate: Date;
        isAutoApproved: boolean;
        requestedAt: Date;
        respondedAt: Date | null;
        respondedBy: string | null;
    }>;
    getBalance(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        employeeId: string;
        year: number;
        total: number;
        used: number;
        remaining: number;
    }[]>;
    private getAdminsForDepartment;
    private getMonthlyLeaveUsage;
}
