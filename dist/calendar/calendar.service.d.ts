import { PrismaService } from '../prisma/prisma.service';
export declare class CalendarService {
    private prisma;
    constructor(prisma: PrismaService);
    getHolidays(start: Date, end: Date): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.CalendarEventType;
        title: string;
        description: string | null;
        date: Date;
    }[]>;
    isHoliday(date: Date): Promise<boolean>;
    seedHolidays(year: number): Promise<void>;
}
