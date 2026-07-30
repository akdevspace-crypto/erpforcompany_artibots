import { PrismaService } from '../prisma/prisma.service';
export declare class EfficiencyService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    calculateEfficiency(employeeId: string, period: any, startDate: Date, endDate: Date): Promise<number>;
    private checkIfOnLeave;
}
