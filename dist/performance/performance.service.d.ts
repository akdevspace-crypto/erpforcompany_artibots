import { PrismaService } from '../prisma/prisma.service';
import { CreatePerformanceReportDto } from './dto/create-performance-report.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { EfficiencyService } from './efficiency.service';
export declare class PerformanceService {
    private prisma;
    private efficiencyService;
    private notificationsService;
    constructor(prisma: PrismaService, efficiencyService: EfficiencyService, notificationsService: NotificationsService);
    create(dto: CreatePerformanceReportDto, creator: any, storedFileId?: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        fileUrl: string | null;
        employeeId: string;
        storedFileId: string | null;
        status: import(".prisma/client").$Enums.SubmissionStatus;
        dueDate: Date | null;
        projectName: string;
        periodStart: Date;
        periodEnd: Date;
        rating: number | null;
        feedback: string | null;
        reviewerId: string | null;
        submissionDate: Date | null;
    }>;
    update(id: string, dto: any, user: any): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        fileUrl: string | null;
        employeeId: string;
        storedFileId: string | null;
        status: import(".prisma/client").$Enums.SubmissionStatus;
        dueDate: Date | null;
        projectName: string;
        periodStart: Date;
        periodEnd: Date;
        rating: number | null;
        feedback: string | null;
        reviewerId: string | null;
        submissionDate: Date | null;
    }>;
    getAnalysis(user: any, period: 'WEEKLY' | 'MONTHLY' | 'YEARLY'): Promise<{
        period: "WEEKLY" | "MONTHLY" | "YEARLY";
        averageRating: number;
        totalReports: number;
        reports: never[];
        hikeEligibility: boolean;
        startDate?: undefined;
        endDate?: undefined;
        averageEfficiency?: undefined;
    } | {
        period: "YEARLY";
        reports: {
            month: string;
            efficiency: number;
            rating: number;
            hours: number;
        }[];
        hikeEligibility: boolean;
        averageRating?: undefined;
        totalReports?: undefined;
        startDate?: undefined;
        endDate?: undefined;
        averageEfficiency?: undefined;
    } | {
        period: "WEEKLY" | "MONTHLY";
        startDate: Date;
        endDate: Date;
        averageRating: number;
        averageEfficiency: number;
        totalReports: number;
        hikeEligibility: boolean;
        reports: {
            date: string;
            efficiency: number;
            rating: number;
            hours: number;
        }[];
    }>;
    findAll(user: any): Promise<({
        reviewer: {
            email: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        title: string;
        fileUrl: string | null;
        employeeId: string;
        storedFileId: string | null;
        status: import(".prisma/client").$Enums.SubmissionStatus;
        dueDate: Date | null;
        projectName: string;
        periodStart: Date;
        periodEnd: Date;
        rating: number | null;
        feedback: string | null;
        reviewerId: string | null;
        submissionDate: Date | null;
    })[] | undefined>;
    private getAdminsForDepartment;
}
