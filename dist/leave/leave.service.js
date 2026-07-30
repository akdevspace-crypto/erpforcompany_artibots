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
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
let LeaveService = class LeaveService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async findMe(userId) {
        const employee = await this.prisma.employee.findUnique({
            where: { userId },
        });
        if (!employee) {
            return [];
        }
        return this.prisma.leave.findMany({
            where: { employeeId: employee.id },
            include: {
                department: true,
            },
            orderBy: {
                requestedAt: 'desc',
            },
        });
    }
    async findAll(user) {
        if (user.role === client_1.Role.SUPER_ADMIN) {
            return this.prisma.leave.findMany({
                include: {
                    employee: {
                        include: {
                            user: true,
                            leaveBalances: true
                        }
                    },
                    department: true
                },
                orderBy: { requestedAt: 'desc' }
            });
        }
        else if (user.role === client_1.Role.ADMIN) {
            if (!user.departmentId) {
                return [];
            }
            return this.prisma.leave.findMany({
                where: { departmentId: user.departmentId },
                include: {
                    employee: {
                        include: {
                            user: true,
                            leaveBalances: true
                        }
                    },
                    department: true
                },
                orderBy: { requestedAt: 'desc' }
            });
        }
        return [];
    }
    async create(dto, userId) {
        const employee = await this.prisma.employee.findUnique({ where: { userId } });
        if (!employee)
            throw new common_1.NotFoundException('Employee profile not found');
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.departmentId)
            throw new common_1.ForbiddenException('User has no department');
        const year = new Date().getFullYear();
        const type = dto.type.toUpperCase();
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);
        if (endDate < startDate) {
            throw new common_1.BadRequestException('End date cannot be before start date');
        }
        const overlappingLeave = await this.prisma.leave.findFirst({
            where: {
                employeeId: employee.id,
                status: { notIn: [client_1.LeaveStatus.REJECTED, client_1.LeaveStatus.CANCELLED] },
                AND: [
                    { startDate: { lte: endDate } },
                    { endDate: { gte: startDate } }
                ]
            }
        });
        if (overlappingLeave) {
            throw new common_1.BadRequestException('You have already applied for leave on these dates');
        }
        let days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        if (type === 'PERMISSION') {
            days = days * 0.5;
        }
        let balance = await this.prisma.leaveTokenBalance.findUnique({
            where: {
                employeeId_year_type: {
                    employeeId: employee.id,
                    year,
                    type
                }
            }
        });
        if (!balance) {
            let total = 0;
            if (type === 'SICK')
                total = 12;
            else if (type === 'CASUAL')
                total = 18;
            else if (type === 'PERMISSION')
                total = 6;
            else if (type === 'LOP')
                total = 60;
            else if (type === 'MENSTRUATION')
                total = 24;
            else if (type === 'WORK_FROM_HOME')
                total = 24;
            balance = await this.prisma.leaveTokenBalance.create({
                data: {
                    employeeId: employee.id,
                    year,
                    type,
                    total,
                    remaining: total
                }
            });
        }
        if (type === 'MENSTRUATION') {
            if (employee.gender !== 'FEMALE') {
                throw new common_1.ForbiddenException('Menstruation leave is only for female employees');
            }
            const startOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
            const endOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
            const monthlyLeaves = await this.prisma.leave.findMany({
                where: {
                    employeeId: employee.id,
                    type: 'MENSTRUATION',
                    startDate: { gte: startOfMonth },
                    endDate: { lte: endOfMonth },
                    status: { not: 'REJECTED' }
                }
            });
            const usedThisMonth = monthlyLeaves.reduce((acc, leave) => {
                const d = Math.ceil((leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                return acc + d;
            }, 0);
            if (usedThisMonth + days > 2) {
                throw new common_1.ForbiddenException('Monthly menstruation leave limit (2 days) exceeded');
            }
        }
        const monthlyLimits = {
            'SICK': 1,
            'CASUAL': 1.5,
            'PERMISSION': 0.5,
            'LOP': 5,
            'MENSTRUATION': 2
        };
        const monthlyLimit = monthlyLimits[type] || 999;
        const usedThisMonth = await this.getMonthlyLeaveUsage(employee.id, type, startDate);
        let isWithinMonthlyLimit = (usedThisMonth + days) <= monthlyLimit;
        let hasSufficientTokens = false;
        let isAutoApproved = false;
        if (type === 'WORK_FROM_HOME') {
            isAutoApproved = days <= 3;
        }
        else {
            hasSufficientTokens = balance.remaining >= days;
            if (hasSufficientTokens && isWithinMonthlyLimit) {
                isAutoApproved = true;
            }
            else {
                isAutoApproved = false;
            }
        }
        if (type === 'MENSTRUATION' && !hasSufficientTokens) {
            isAutoApproved = false;
        }
        console.log(`[AutoApproval] Leave Type: ${type}, Date: ${startDate}, Days: ${days}, Balance: ${balance?.remaining}, UsedMonth: ${usedThisMonth}, Limit: ${monthlyLimit}, AutoApproved: ${isAutoApproved}`);
        const status = isAutoApproved ? client_1.LeaveStatus.APPROVED : client_1.LeaveStatus.PENDING;
        await this.prisma.leaveTokenBalance.update({
            where: { id: balance.id },
            data: {
                used: { increment: days },
                remaining: { decrement: days }
            }
        });
        const leave = await this.prisma.leave.create({
            data: {
                employeeId: employee.id,
                departmentId: user.departmentId,
                type: dto.type,
                startDate,
                endDate,
                reason: dto.reason,
                status,
                isAutoApproved,
                respondedAt: isAutoApproved ? new Date() : null,
                respondedBy: isAutoApproved ? 'SYSTEM' : null
            }
        });
        const admins = await this.getAdminsForDepartment(user.departmentId);
        const adminIds = admins.map(a => a.id);
        const employeeName = `${employee.firstName} ${employee.lastName}`;
        await this.notificationsService.createAndBroadcast(adminIds, 'LEAVE_REQUEST', leave.id, {
            title: isAutoApproved ? 'Leave Auto-Approved' : 'New Leave Request',
            message: `${employeeName} requested ${dto.type} leave (${days} days). Status: ${status}`,
            employeeName,
            leaveType: dto.type,
            startDate,
            endDate
        });
        return leave;
    }
    async updateStatus(id, status, user) {
        const leave = await this.prisma.leave.findUnique({ where: { id } });
        if (!leave)
            throw new common_1.NotFoundException('Leave request not found');
        if (user.role === client_1.Role.EMPLOYEE)
            throw new common_1.ForbiddenException('Employees cannot update status');
        if (user.role === client_1.Role.ADMIN && user.departmentId !== leave.departmentId) {
            throw new common_1.ForbiddenException('Cannot update leave for another department');
        }
        if ((status === client_1.LeaveStatus.REJECTED || status === client_1.LeaveStatus.CANCELLED) && leave.status !== client_1.LeaveStatus.REJECTED && leave.status !== client_1.LeaveStatus.CANCELLED) {
            let days = Math.ceil((leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            if (leave.type === 'PERMISSION') {
                days = days * 0.5;
            }
            const year = leave.startDate.getFullYear();
            const balance = await this.prisma.leaveTokenBalance.findUnique({
                where: {
                    employeeId_year_type: {
                        employeeId: leave.employeeId,
                        year,
                        type: leave.type.toUpperCase()
                    }
                }
            });
            if (balance) {
                await this.prisma.leaveTokenBalance.update({
                    where: { id: balance.id },
                    data: {
                        used: { decrement: days },
                        remaining: { increment: days }
                    }
                });
            }
        }
        const updatedLeave = await this.prisma.leave.update({
            where: { id },
            data: {
                status: status,
                respondedAt: new Date(),
                respondedBy: user.id
            },
            include: { employee: true }
        });
        await this.notificationsService.createAndBroadcast([updatedLeave.employee.userId], 'LEAVE_RESPONSE', updatedLeave.id, {
            title: 'Leave Request Update',
            message: `Your leave request has been ${status}`,
            status
        });
        return updatedLeave;
    }
    async getBalance(userId) {
        const employee = await this.prisma.employee.findUnique({ where: { userId } });
        if (!employee)
            return [];
        const year = new Date().getFullYear();
        return this.prisma.leaveTokenBalance.findMany({
            where: { employeeId: employee.id, year }
        });
    }
    async getAdminsForDepartment(departmentId) {
        return this.prisma.user.findMany({
            where: {
                OR: [
                    { role: client_1.Role.SUPER_ADMIN },
                    { role: client_1.Role.ADMIN, departmentId }
                ]
            }
        });
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
exports.LeaveService = LeaveService;
exports.LeaveService = LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], LeaveService);
//# sourceMappingURL=leave.service.js.map