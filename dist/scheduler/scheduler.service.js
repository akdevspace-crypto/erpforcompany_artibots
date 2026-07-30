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
var SchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const efficiency_service_1 = require("../performance/efficiency.service");
let SchedulerService = SchedulerService_1 = class SchedulerService {
    prisma;
    efficiencyService;
    logger = new common_1.Logger(SchedulerService_1.name);
    constructor(prisma, efficiencyService) {
        this.prisma = prisma;
        this.efficiencyService = efficiencyService;
    }
    async handleDailyReportPreReminder() {
        this.logger.debug('Running 5:55 PM Daily Report Reminder');
        await this.sendDailyReportReminders('Daily Report Due in 5 Minutes!', 'Please submit your daily task report by 6:00 PM to avoid efficiency penalty.');
    }
    async handleDailyReportFinalReminder() {
        this.logger.debug('Running 5:58 PM Final Daily Report Reminder');
        await this.sendDailyReportReminders('URGENT: 2 Minutes Left!', 'Submit your daily report NOW or face -0.1% efficiency penalty.');
    }
    async sendDailyReportReminders(title, body) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const employees = await this.prisma.employee.findMany({
            include: { user: true }
        });
        for (const emp of employees) {
            const report = await this.prisma.taskDailyReport.findFirst({
                where: {
                    employeeId: emp.id,
                    createdAt: { gte: today, lt: tomorrow }
                }
            });
            if (!report) {
                await this.prisma.notification.create({
                    data: {
                        userId: emp.userId,
                        title: title,
                        body: body,
                        type: 'WARNING',
                        read: false
                    }
                });
            }
        }
    }
    async checkProjectDeadlines() {
        this.logger.debug('Checking Project Deadlines');
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        const reports = await this.prisma.performanceReport.findMany({
            where: {
                dueDate: {
                    gt: now,
                    lte: oneHourLater
                },
                submissionDate: null
            },
            include: {
                employee: {
                    include: { user: true }
                }
            }
        });
        for (const r of reports) {
            const report = r;
            if (report.employee?.user && report.dueDate) {
                const minutesLeft = Math.floor((new Date(report.dueDate).getTime() - now.getTime()) / 60000);
                await this.prisma.notification.create({
                    data: {
                        userId: report.employee.user.id,
                        title: 'Project Report Deadline Approaching',
                        body: `Your report for project "${report.projectName}" is due in ${minutesLeft} minutes. Please submit it to avoid penalties.`,
                        type: 'WARNING',
                        read: false
                    }
                });
                this.logger.log(`Sent deadline notification to ${report.employee.user.email} for report ${report.id}`);
            }
        }
    }
    async handleWeeklyEfficiency() {
        this.logger.log('Running Weekly Efficiency Calculation');
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        await this.triggerEfficiencyCalculation('WEEKLY', start, end);
    }
    async handleMonthlyEfficiency() {
        this.logger.log('Running Monthly Efficiency Calculation');
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        await this.triggerEfficiencyCalculation('MONTHLY', start, end);
    }
    async triggerEfficiencyCalculation(period, start, end) {
        const employees = await this.prisma.employee.findMany();
        for (const emp of employees) {
            try {
                await this.efficiencyService.calculateEfficiency(emp.id, period, start, end);
            }
            catch (error) {
                this.logger.error(`Failed efficiency calc for ${emp.id}`, error);
            }
        }
    }
};
exports.SchedulerService = SchedulerService;
__decorate([
    (0, schedule_1.Cron)('55 17 * * 1-5'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleDailyReportPreReminder", null);
__decorate([
    (0, schedule_1.Cron)('58 17 * * 1-5'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleDailyReportFinalReminder", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "checkProjectDeadlines", null);
__decorate([
    (0, schedule_1.Cron)('59 23 * * 0'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleWeeklyEfficiency", null);
__decorate([
    (0, schedule_1.Cron)('5 0 1 * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleMonthlyEfficiency", null);
exports.SchedulerService = SchedulerService = SchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        efficiency_service_1.EfficiencyService])
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map