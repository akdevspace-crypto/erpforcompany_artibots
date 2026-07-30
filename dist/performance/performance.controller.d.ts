import { PerformanceService } from './performance.service';
import { FilesService } from '../files/files.service';
import { CreatePerformanceReportDto } from './dto/create-performance-report.dto';
export declare class PerformanceController {
    private readonly performanceService;
    private readonly filesService;
    constructor(performanceService: PerformanceService, filesService: FilesService);
    create(createPerformanceReportDto: CreatePerformanceReportDto, req: any, file: Express.Multer.File): Promise<{
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
    update(id: string, body: any, req: any): Promise<{
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
    getAnalysis(req: any, period: 'WEEKLY' | 'MONTHLY' | 'YEARLY'): Promise<{
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
    findAll(req: any): Promise<({
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
}
