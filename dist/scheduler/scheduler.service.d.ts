import { PrismaService } from '../prisma/prisma.service';
import { EfficiencyService } from '../performance/efficiency.service';
export declare class SchedulerService {
    private prisma;
    private efficiencyService;
    private readonly logger;
    constructor(prisma: PrismaService, efficiencyService: EfficiencyService);
    handleDailyReportPreReminder(): Promise<void>;
    handleDailyReportFinalReminder(): Promise<void>;
    private sendDailyReportReminders;
    checkProjectDeadlines(): Promise<void>;
    handleWeeklyEfficiency(): Promise<void>;
    handleMonthlyEfficiency(): Promise<void>;
    private triggerEfficiencyCalculation;
}
