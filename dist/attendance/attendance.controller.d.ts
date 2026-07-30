import { AttendanceService } from './attendance.service';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    findToday(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
    } | {
        status: "ABSENT";
    }>;
    checkIn(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
    }>;
    checkOut(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
    }>;
}
