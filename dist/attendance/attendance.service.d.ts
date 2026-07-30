import { PrismaService } from '../prisma/prisma.service';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getTodayRecord(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
    } | null>;
    findToday(userId: string): Promise<{
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
    checkIn(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
    }>;
    checkOut(userId: string): Promise<{
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
