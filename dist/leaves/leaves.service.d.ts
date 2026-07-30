import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
import { TokensService } from '../tokens/tokens.service';
export declare class LeavesService {
    private prisma;
    private tokensService;
    constructor(prisma: PrismaService, tokensService: TokensService);
    requestLeave(userId: string, createLeaveDto: CreateLeaveDto): Promise<{
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
    listMine(userId: string): Promise<{
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
    }[]>;
    listForAdmin(user: any): Promise<({
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
    })[]>;
    updateStatus(id: string, updateLeaveStatusDto: UpdateLeaveStatusDto, user: any): Promise<{
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
    getMonthlyLeaveUsage(employeeId: string, type: string, date: Date): Promise<number>;
}
