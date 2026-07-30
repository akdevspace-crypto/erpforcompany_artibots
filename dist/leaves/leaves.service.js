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
exports.LeavesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const tokens_service_1 = require("../tokens/tokens.service");
let LeavesService = class LeavesService {
    prisma;
    tokensService;
    constructor(prisma, tokensService) {
        this.prisma = prisma;
        this.tokensService = tokensService;
    }
    async requestLeave(userId, createLeaveDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { employee: true } });
        if (!user || !user.employee)
            throw new common_1.NotFoundException('Employee profile not found');
        const start = new Date(createLeaveDto.startDate);
        const end = new Date(createLeaveDto.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if (createLeaveDto.type === 'MENSTRUATION') {
            if (user.employee.gender !== client_1.Gender.FEMALE) {
                throw new common_1.ForbiddenException('Menstruation leave is only available for female employees');
            }
            const hasBalance = await this.tokensService.checkBalance(user.employee.id, createLeaveDto.type, diffDays);
            if (!hasBalance)
                throw new common_1.ForbiddenException('Insufficient leave balance');
        }
        else {
            if (createLeaveDto.type !== 'WORK_FROM_HOME') {
                const hasBalance = await this.tokensService.checkBalance(user.employee.id, createLeaveDto.type, diffDays);
                if (!hasBalance)
                    throw new common_1.ForbiddenException('Insufficient leave balance');
            }
        }
        if (!user.departmentId) {
            throw new common_1.NotFoundException('User does not belong to a department');
        }
        let status = client_1.LeaveStatus.PENDING;
        let isAutoApproved = false;
        if (createLeaveDto.type === 'LOSS_OF_PAY' || createLeaveDto.type === 'PERMISSION') {
            status = client_1.LeaveStatus.PENDING;
        }
        else if (createLeaveDto.type === 'SICK') {
            status = client_1.LeaveStatus.APPROVED;
            isAutoApproved = true;
        }
        else {
            let monthlyLimit = 3;
            if (createLeaveDto.type === 'MENSTRUATION')
                monthlyLimit = 2;
            if (createLeaveDto.type === 'WORK_FROM_HOME')
                monthlyLimit = 24;
            if (createLeaveDto.type === 'WORK_FROM_HOME') {
                status = client_1.LeaveStatus.PENDING;
                isAutoApproved = false;
            }
            else {
                const usage = await this.getMonthlyLeaveUsage(user.employee.id, createLeaveDto.type, start);
                if ((usage + diffDays) <= monthlyLimit) {
                    status = client_1.LeaveStatus.APPROVED;
                    isAutoApproved = true;
                }
                else {
                    status = client_1.LeaveStatus.PENDING;
                }
            }
        }
        const leave = await this.prisma.leave.create({
            data: {
                employeeId: user.employee.id,
                departmentId: user.departmentId,
                type: createLeaveDto.type,
                reason: createLeaveDto.reason,
                startDate: createLeaveDto.startDate,
                endDate: createLeaveDto.endDate,
                status: status,
                isAutoApproved: isAutoApproved,
            }
        });
        if (leave.status === client_1.LeaveStatus.APPROVED) {
            if (leave.type !== 'WORK_FROM_HOME') {
                await this.tokensService.deductTokens(user.employee.id, leave.type, diffDays);
            }
            await this.prisma.notification.create({
                data: {
                    userId: user.id,
                    title: 'Leave Approved',
                    body: `Your ${leave.type} request has been auto-approved.`,
                }
            });
            const notifyRoles = [client_1.Role.SUPER_ADMIN];
            const hrDept = await this.prisma.department.findUnique({ where: { name: 'Human Resources' } });
            const recipients = [];
            const deptAdmins = await this.prisma.user.findMany({
                where: { departmentId: user.departmentId, role: client_1.Role.ADMIN }
            });
            recipients.push(...deptAdmins);
            const superAdmins = await this.prisma.user.findMany({
                where: { role: client_1.Role.SUPER_ADMIN }
            });
            recipients.push(...superAdmins);
            if (hrDept && hrDept.id !== user.departmentId) {
                const hrAdmins = await this.prisma.user.findMany({
                    where: { departmentId: hrDept.id, role: client_1.Role.ADMIN }
                });
                recipients.push(...hrAdmins);
            }
            const uniqueRecipients = Array.from(new Map(recipients.map(u => [u.id, u])).values());
            if (uniqueRecipients.length > 0) {
                await this.prisma.notification.createMany({
                    data: uniqueRecipients.map(admin => ({
                        userId: admin.id,
                        title: 'Auto-Approved Leave',
                        body: `${user.employee.firstName} ${user.employee.lastName}'s ${createLeaveDto.type} was auto-approved.`,
                        type: 'INFO',
                    }))
                });
            }
        }
        else {
            const admins = await this.prisma.user.findMany({
                where: {
                    departmentId: user.departmentId,
                    role: client_1.Role.ADMIN,
                }
            });
            if (admins.length > 0) {
                await this.prisma.notification.createMany({
                    data: admins.map(admin => ({
                        userId: admin.id,
                        title: 'New Leave Request',
                        body: `${user.employee.firstName} ${user.employee.lastName} requested ${createLeaveDto.type}.`,
                    }))
                });
            }
        }
        return leave;
    }
    async listMine(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { employee: true } });
        if (!user || !user.employee)
            throw new common_1.NotFoundException('Employee profile not found');
        return this.prisma.leave.findMany({
            where: { employeeId: user.employee.id },
            orderBy: { requestedAt: 'desc' }
        });
    }
    async listForAdmin(user) {
        if (user.role === client_1.Role.SUPER_ADMIN) {
            return this.prisma.leave.findMany({ include: { employee: true } });
        }
        else if (user.role === client_1.Role.ADMIN) {
            return this.prisma.leave.findMany({
                where: { departmentId: user.departmentId },
                include: { employee: true }
            });
        }
        return [];
    }
    async updateStatus(id, updateLeaveStatusDto, user) {
        const leave = await this.prisma.leave.findUnique({ where: { id }, include: { employee: true } });
        if (!leave)
            throw new common_1.NotFoundException('Leave not found');
        if (user.role === client_1.Role.ADMIN && leave.departmentId !== user.departmentId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const updatedLeave = await this.prisma.leave.update({
            where: { id },
            data: {
                status: updateLeaveStatusDto.status,
                respondedAt: new Date(),
                respondedBy: user.id,
            }
        });
        if (updatedLeave.status === client_1.LeaveStatus.APPROVED) {
            const start = new Date(updatedLeave.startDate);
            const end = new Date(updatedLeave.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            if (updatedLeave.type !== 'WORK_FROM_HOME') {
                await this.tokensService.deductTokens(updatedLeave.employeeId, updatedLeave.type, diffDays);
            }
        }
        await this.prisma.notification.create({
            data: {
                userId: leave.employee.userId,
                title: `Leave ${updateLeaveStatusDto.status}`,
                body: `Your leave request has been ${updateLeaveStatusDto.status.toLowerCase()}.`,
            }
        });
        return updatedLeave;
    }
    async getMonthlyLeaveUsage(employeeId, type, date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);
        const leaves = await this.prisma.leave.findMany({
            where: {
                employeeId,
                type,
                status: { in: [client_1.LeaveStatus.APPROVED, client_1.LeaveStatus.PENDING] },
                startDate: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
        });
        let totalDays = 0;
        for (const leave of leaves) {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            totalDays += diffDays;
        }
        return totalDays;
    }
};
exports.LeavesService = LeavesService;
exports.LeavesService = LeavesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tokens_service_1.TokensService])
], LeavesService);
//# sourceMappingURL=leaves.service.js.map