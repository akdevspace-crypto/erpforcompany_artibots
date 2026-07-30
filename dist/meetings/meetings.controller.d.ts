import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
export declare class MeetingsController {
    private readonly meetingsService;
    constructor(meetingsService: MeetingsService);
    create(createMeetingDto: CreateMeetingDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        title: string;
        description: string | null;
        scheduledAt: Date;
        duration: number;
    }>;
    findAll(date: string): Promise<({
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
}
