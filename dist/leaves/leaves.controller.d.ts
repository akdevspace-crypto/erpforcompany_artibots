import { LeavesService } from './leaves.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto';
export declare class LeavesController {
    private readonly leavesService;
    constructor(leavesService: LeavesService);
    requestLeave(createLeaveDto: CreateLeaveDto, req: any): Promise<{
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
    listMine(req: any): Promise<{
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
    listForAdmin(req: any): Promise<({
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
    updateStatus(id: string, updateLeaveStatusDto: UpdateLeaveStatusDto, req: any): Promise<{
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
}
