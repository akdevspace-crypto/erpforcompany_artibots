import { CalendarService } from './calendar.service';
export declare class CalendarController {
    private readonly calendarService;
    constructor(calendarService: CalendarService);
    getPublicEvents(start: string, end: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.CalendarEventType;
        title: string;
        description: string | null;
        date: Date;
    }[]>;
    createEvent(data: {
        title: string;
        date: string;
        type: 'HOLIDAY' | 'EVENT' | 'SHUTDOWN';
    }): Promise<{
        message: string;
    }>;
}
