import { PrismaService } from '../prisma/prisma.service';
export declare class TokensService {
    private prisma;
    constructor(prisma: PrismaService);
    getBalancesByUserId(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        employeeId: string;
        year: number;
        total: number;
        used: number;
        remaining: number;
    }[]>;
    getBalances(employeeId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        employeeId: string;
        year: number;
        total: number;
        used: number;
        remaining: number;
    }[]>;
    ensureBalancesExist(employeeId: string, year: number): Promise<void>;
    validateAdminAccess(adminUser: any, targetEmployeeId: string): Promise<void>;
    checkBalance(employeeId: string, type: string, days: number): Promise<boolean>;
    deductTokens(employeeId: string, type: string, days: number): Promise<void>;
}
