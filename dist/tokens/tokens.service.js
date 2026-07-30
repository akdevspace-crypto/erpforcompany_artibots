"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokensService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TokensService = class TokensService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBalancesByUserId(userId) {
        const employee = await this.prisma.employee.findUnique({
            where: { userId },
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee record not found');
        return this.getBalances(employee.id);
    }
    async getBalances(employeeId) {
        const currentYear = new Date().getFullYear();
        await this.ensureBalancesExist(employeeId, currentYear);
        return this.prisma.leaveTokenBalance.findMany({
            where: {
                employeeId,
                year: currentYear,
            },
        });
    }
    async ensureBalancesExist(employeeId, year) {
        const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        const requiredBalances = [
            { type: 'SICK', total: 12 },
            { type: 'CASUAL', total: 18 },
            { type: 'PERMISSION', total: 6 },
            { type: 'LOSS_OF_PAY', total: 5 },
            { type: 'WORK_FROM_HOME', total: 24 },
        ];
        if (employee.gender === 'FEMALE') {
            requiredBalances.push({ type: 'MENSTRUATION', total: 24 });
        }
        for (const b of requiredBalances) {
            const existing = await this.prisma.leaveTokenBalance.findUnique({
                where: {
                    employeeId_year_type: {
                        employeeId,
                        year,
                        type: b.type
                    }
                }
            });
            if (!existing) {
                await this.prisma.leaveTokenBalance.create({
                    data: {
                        employeeId,
                        year,
                        type: b.type,
                        total: b.total,
                        remaining: b.total,
                        used: 0,
                    },
                });
            }
        }
    }
    async validateAdminAccess(adminUser, targetEmployeeId) {
        if (adminUser.role === client_1.Role.SUPER_ADMIN)
            return;
        const employee = await this.prisma.employee.findUnique({
            where: { id: targetEmployeeId },
            include: { user: true },
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        if (employee.user.departmentId !== adminUser.departmentId) {
            throw new common_1.ForbiddenException('Access denied: Employee belongs to another department');
        }
    }
    async checkBalance(employeeId, type, days) {
        const currentYear = new Date().getFullYear();
        await this.ensureBalancesExist(employeeId, currentYear);
        const balance = await this.prisma.leaveTokenBalance.findUnique({
            where: {
                employeeId_year_type: {
                    employeeId,
                    year: currentYear,
                    type,
                },
            },
        });
        if (!balance)
            throw new common_1.NotFoundException(`No balance found for leave type ${type}`);
        if (balance.remaining < days) {
            return false;
        }
        return true;
    }
    async deductTokens(employeeId, type, days) {
        const currentYear = new Date().getFullYear();
        await this.ensureBalancesExist(employeeId, currentYear);
        const balance = await this.prisma.leaveTokenBalance.findUnique({
            where: {
                employeeId_year_type: {
                    employeeId,
                    year: currentYear,
                    type,
                },
            },
        });
        if (!balance || balance.remaining < days) {
            throw new common_1.ForbiddenException('Insufficient leave balance');
        }
        await this.prisma.leaveTokenBalance.update({
            where: { id: balance.id },
            data: {
                used: { increment: days },
                remaining: { decrement: days },
            },
        });
    }
};
exports.TokensService = TokensService;
exports.TokensService = TokensService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TokensService);
//# sourceMappingURL=tokens.service.js.map