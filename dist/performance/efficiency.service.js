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
var EfficiencyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EfficiencyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EfficiencyService = EfficiencyService_1 = class EfficiencyService {
    prisma;
    logger = new common_1.Logger(EfficiencyService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateEfficiency(employeeId, period, startDate, endDate) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
            include: { user: true }
        });
        if (!employee)
            return 0;
        let score = 100;
        const breakdown = {};
        const attendanceRecords = await this.prisma.attendance.findMany({
            where: {
                userId: employee.userId,
                date: { gte: startDate, lte: endDate }
            }
        });
        let workingDays = 0;
        let daysChecked = 0;
        const currentCheck = new Date(startDate);
        while (currentCheck <= endDate && currentCheck <= new Date()) {
            if (currentCheck.getDay() !== 0) {
                workingDays++;
                const record = attendanceRecords.find(r => r.date.getDate() === currentCheck.getDate() &&
                    r.date.getMonth() === currentCheck.getMonth());
                if (!record) {
                    const isOnLeave = await this.checkIfOnLeave(employee.id, currentCheck);
                    if (!isOnLeave) {
                        score -= 0.5;
                        breakdown['absent_nopermission'] = (breakdown['absent_nopermission'] || 0) - 0.5;
                    }
                }
                else if (record.status === 'LATE') {
                    score -= 0.5;
                    breakdown['late_arrival'] = (breakdown['late_arrival'] || 0) - 0.5;
                }
            }
            currentCheck.setDate(currentCheck.getDate() + 1);
            daysChecked++;
        }
        const dailyReports = await this.prisma.taskDailyReport.findMany({
            where: {
                employeeId: employee.id,
                createdAt: { gte: startDate, lte: endDate }
            }
        });
        const reportCheckDate = new Date(startDate);
        while (reportCheckDate <= endDate && reportCheckDate <= new Date()) {
            if (reportCheckDate.getDay() !== 0) {
                const isOnLeave = await this.checkIfOnLeave(employee.id, reportCheckDate);
                if (!isOnLeave) {
                    const hasReport = dailyReports.some(r => r.createdAt.getDate() === reportCheckDate.getDate() &&
                        r.createdAt.getMonth() === reportCheckDate.getMonth());
                    if (!hasReport) {
                        score -= 0.5;
                        breakdown['missed_daily_report'] = (breakdown['missed_daily_report'] || 0) - 0.5;
                    }
                }
            }
            reportCheckDate.setDate(reportCheckDate.getDate() + 1);
        }
        const projectReports = await this.prisma.performanceReport.findMany({
            where: {
                employeeId: employee.id,
                dueDate: { gte: startDate, lte: endDate }
            }
        });
        for (const r of projectReports) {
            const report = r;
            if (!report.submissionDate && report.dueDate && new Date() > report.dueDate) {
                score -= 0.5;
                breakdown['missed_project_deadline'] = (breakdown['missed_project_deadline'] || 0) - 0.5;
            }
            else if (report.submissionDate && report.dueDate && report.submissionDate > report.dueDate) {
                score -= 0.5;
                breakdown['late_project_submission'] = (breakdown['late_project_submission'] || 0) - 0.5;
            }
        }
        let absentDays = 0;
        const absentCheckDate = new Date(startDate);
        while (absentCheckDate <= endDate && absentCheckDate <= new Date()) {
            if (absentCheckDate.getDay() !== 0) {
                const record = attendanceRecords.find(r => r.date.toDateString() === absentCheckDate.toDateString());
                if (!record) {
                    const isOnLeave = await this.checkIfOnLeave(employee.id, absentCheckDate);
                    if (!isOnLeave)
                        absentDays++;
                }
            }
            absentCheckDate.setDate(absentCheckDate.getDate() + 1);
        }
        if (absentDays >= 5) {
            score -= 3.0;
            breakdown['excessive_absenteeism'] = -3.0;
        }
        else if (absentDays >= 3) {
            score -= 1.0;
            breakdown['excessive_absenteeism'] = -1.0;
        }
        else if (absentDays >= 2) {
            score -= 0.5;
            breakdown['excessive_absenteeism'] = -0.5;
        }
        const meetings = await this.prisma.meetingAttendance.findMany({
            where: {
                employeeId: employee.id,
                meeting: {
                    scheduledAt: { gte: startDate, lte: endDate }
                }
            },
            include: { meeting: true }
        });
        for (const att of meetings) {
            if (!att.attended) {
                score -= 0.5;
                breakdown['missed_meeting'] = (breakdown['missed_meeting'] || 0) - 0.5;
            }
            if (att.attended && !att.reportSubmitted) {
                score -= 1.0;
                breakdown['poor_meeting_involvement'] = (breakdown['poor_meeting_involvement'] || 0) - 1.0;
            }
        }
        const completedCourses = await this.prisma.learningResource.findMany({
            where: {
                employeeId: employee.id,
                status: 'COMPLETED',
                storedFile: {
                    createdAt: { gte: startDate, lte: endDate }
                }
            },
            include: { storedFile: true }
        });
        if (completedCourses.length > 0) {
            const bonus = completedCourses.length * 5;
            score += bonus;
            breakdown['self_development_bonus'] = bonus;
        }
        score = Math.max(0, Math.min(100, score));
        await this.prisma.efficiencyRecord.create({
            data: {
                employeeId: employee.id,
                period,
                startDate,
                endDate,
                score,
                breakdown
            }
        });
        return score;
    }
    async checkIfOnLeave(employeeId, date) {
        const leave = await this.prisma.leave.findFirst({
            where: {
                employeeId,
                status: 'APPROVED',
                startDate: { lte: date },
                endDate: { gte: date }
            }
        });
        return !!leave;
    }
};
exports.EfficiencyService = EfficiencyService;
exports.EfficiencyService = EfficiencyService = EfficiencyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EfficiencyService);
//# sourceMappingURL=efficiency.service.js.map