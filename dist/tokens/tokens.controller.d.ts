import { TokensService } from './tokens.service';
export declare class TokensController {
    private readonly tokensService;
    constructor(tokensService: TokensService);
    getMyBalances(req: any): Promise<{
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
    getEmployeeBalances(employeeId: string, req: any): Promise<{
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
}
