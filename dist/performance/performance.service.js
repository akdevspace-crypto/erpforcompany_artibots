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
exports.PerformanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
const efficiency_service_1 = require("./efficiency.service");
let PerformanceService = class PerformanceService {
    prisma;
    efficiencyService;
    notificationsService;
    constructor(prisma, efficiencyService, notificationsService) {
        this.prisma = prisma;
        this.efficiencyService = efficiencyService;
        this.notificationsService = notificationsService;
    }
    async create(dto, creator, storedFileId) {
        let employeeId = dto.employeeId;
        if (creator.role === client_1.Role.EMPLOYEE) {
            const employee = await this.prisma.employee.findUnique({ where: { userId: creator.id } });
            if (!employee)
                throw new common_1.NotFoundException('Employee profile not found');
            employeeId = employee.id;
        }
        else if (creator.role === client_1.Role.ADMIN) {
            const employee = await this.prisma.employee.findUnique({
                where: { id: dto.employeeId },
                include: { user: true }
            });
            if (!employee)
                throw new common_1.NotFoundException('Employee not found');
            if (employee.user.departmentId !== creator.departmentId) {
                throw new common_1.ForbiddenException('Cannot create report for employee in another department');
            }
        }
        const report = await this.prisma.performanceReport.create({
            data: {
                employeeId,
                title: dto.title,
                projectName: dto.projectName,
                periodStart: dto.periodStart,
                periodEnd: dto.periodEnd,
                fileUrl: dto.fileUrl,
                storedFileId: storedFileId,
                rating: creator.role !== client_1.Role.EMPLOYEE ? dto.rating : null,
            }
        });
        const empUser = await this.prisma.employee.findUnique({ where: { id: employeeId }, include: { user: true } });
        if (empUser && empUser.user.departmentId) {
            const admins = await this.getAdminsForDepartment(empUser.user.departmentId);
            const adminIds = admins.map(a => a.id);
            const employeeName = `${empUser.firstName} ${empUser.lastName}`;
            await this.notificationsService.createAndBroadcast(adminIds, 'REPORT_SUBMIT', report.id, {
                title: 'New Performance Report',
                message: `${employeeName} submitted a report: ${dto.title}`,
                employeeName,
                projectName: dto.projectName
            });
        }
        return report;
    }
    async update(id, dto, user) {
        const report = await this.prisma.performanceReport.findUnique({ where: { id }, include: { employee: { include: { user: true } } } });
        if (!report)
            throw new common_1.NotFoundException('Report not found');
        if (user.role === client_1.Role.ADMIN) {
            if (report.employee?.user?.departmentId !== user.departmentId) {
                throw new common_1.ForbiddenException('Cannot update report for another department');
            }
        }
        else if (user.role !== client_1.Role.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Only Admins can update reports');
        }
        return this.prisma.performanceReport.update({
            where: { id },
            data: {
                rating: dto.rating,
                feedback: dto.feedback,
                reviewerId: user.id
            }
        });
    }
    async getAnalysis(user, period) {
        const now = new Date();
        const startDate = new Date();
        let days = 7;
        if (period === 'WEEKLY') {
            startDate.setDate(now.getDate() - 7);
            days = 7;
        }
        else if (period === 'MONTHLY') {
            startDate.setDate(now.getDate() - 30);
            days = 30;
        }
        else if (period === 'YEARLY') {
            startDate.setFullYear(now.getFullYear() - 1);
            days = 365;
        }
        let whereClause = {
            createdAt: { gte: startDate }
        };
        if (user.role === client_1.Role.ADMIN) {
            whereClause = {
                ...whereClause,
                employee: { user: { departmentId: user.departmentId } }
            };
        }
        else if (user.role === client_1.Role.EMPLOYEE) {
            const employee = await this.prisma.employee.findUnique({ where: { userId: user.id } });
            if (!employee)
                return { period, averageRating: 0, totalReports: 0, reports: [], hikeEligibility: false };
            whereClause = {
                ...whereClause,
                employeeId: employee.id
            };
        }
        const reports = await this.prisma.performanceReport.findMany({
            where: {
                ...whereClause,
                rating: { not: null }
            },
            select: {
                rating: true,
                createdAt: true,
                employee: { select: { firstName: true, lastName: true } }
            }
        });
        const [dailyReports, leaves, attendanceRecords, calendarEvents] = await this.prisma.$transaction([
            this.prisma.taskDailyReport.findMany({
                where: {
                    ...whereClause,
                    createdAt: { gte: startDate }
                }
            }),
            this.prisma.leave.findMany({
                where: {
                    employeeId: whereClause.employeeId,
                    startDate: { gte: startDate }
                }
            }),
            this.prisma.attendance.findMany({
                where: {
                    userId: user.id,
                    date: { gte: startDate }
                }
            }),
            this.prisma.calendarEvent.findMany({
                where: {
                    date: { gte: startDate },
                    type: { in: ['HOLIDAY', 'SHUTDOWN'] }
                }
            })
        ]);
        const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
        if (period === 'YEARLY') {
            const monthlyData = [];
            for (let i = 0; i < 12; i++) {
                const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthName = monthDate.toLocaleString('default', { month: 'long' });
                const monthReports = dailyReports.filter(r => r.createdAt.getMonth() === monthDate.getMonth() && r.createdAt.getFullYear() === monthDate.getFullYear());
                const monthRatings = reports.filter(r => r.createdAt.getMonth() === monthDate.getMonth() && r.createdAt.getFullYear() === monthDate.getFullYear());
                const monthAttendance = attendanceRecords.filter(a => a.date.getMonth() === monthDate.getMonth() && a.date.getFullYear() === monthDate.getFullYear());
                const avgRating = monthRatings.length > 0 ? monthRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / monthRatings.length : 0;
                const totalHours = monthAttendance.reduce((sum, att) => {
                    if (att.checkIn && att.checkOut) {
                        const raw = (new Date(att.checkOut).getTime() - new Date(att.checkIn).getTime()) / 36e5;
                        return sum + (raw > 5 ? raw - 1 : raw);
                    }
                    return sum;
                }, 0);
                const avgHours = monthAttendance.length > 0 ? totalHours / monthAttendance.length : 0;
                const efficiency = Math.min(100, (monthReports.length / 20) * 100);
                monthlyData.push({
                    month: monthName,
                    efficiency: parseFloat(efficiency.toFixed(1)),
                    rating: parseFloat(avgRating.toFixed(1)),
                    hours: parseFloat(avgHours.toFixed(1))
                });
            }
            return {
                period,
                reports: monthlyData.reverse(),
                hikeEligibility: reports.length > 5 && (reports.reduce((a, b) => a + (b.rating || 0), 0) / reports.length) > 8
            };
        }
        const completedCourses = await this.prisma.learningResource.findMany({
            where: {
                employeeId: whereClause.employeeId,
                status: 'COMPLETED',
                createdAt: { gte: startDate }
            }
        });
        const courseBonus = completedCourses.length * 5;
        const dailyEfficiencyAndRatings = [];
        let totalEfficiency = 0;
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            if (date > now)
                break;
            let dailyEff = 100;
            let hours = 0;
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isHoliday = calendarEvents.some(e => isSameDay(new Date(e.date), date));
            const isLeave = leaves.some(l => date >= new Date(l.startDate) &&
                (l.endDate ? date <= new Date(l.endDate) : isSameDay(date, new Date(l.startDate))) &&
                l.status === 'APPROVED');
            const att = attendanceRecords.find(a => isSameDay(a.date, date));
            if (att && att.checkIn) {
                const checkOutTime = att.checkOut ? new Date(att.checkOut) : (isSameDay(date, new Date()) ? new Date() : null);
                if (checkOutTime) {
                    const rawHours = (checkOutTime.getTime() - new Date(att.checkIn).getTime()) / 36e5;
                    hours = rawHours > 5 ? rawHours - 1 : rawHours;
                }
            }
            if (!isWeekend && !isHoliday && !isLeave) {
                const report = dailyReports.find(r => isSameDay(r.createdAt, date));
                if (!report) {
                    dailyEff -= 0.1;
                }
                else {
                    const submissionHour = new Date(report.createdAt).getHours();
                    if (submissionHour >= 18)
                        dailyEff -= 0.1;
                }
                if (att && att.checkIn) {
                    const h = new Date(att.checkIn).getHours();
                    if (h >= 10 && new Date(att.checkIn).getMinutes() > 0)
                        dailyEff -= 0.5;
                }
                else {
                    if (date < new Date())
                        dailyEff = 0;
                }
            }
            else {
                if (!att)
                    dailyEff = 0;
            }
            dailyEff = Math.max(0, Math.min(100, dailyEff));
            if (dailyEff > 0) {
                dailyEff = Math.min(100, dailyEff + courseBonus);
            }
            if (isWeekend || isHoliday)
                dailyEff = hours > 0 ? 100 : 0;
            const dayReports = reports.filter(r => isSameDay(r.createdAt, date));
            const avgRating = dayReports.length > 0
                ? dayReports.reduce((sum, r) => sum + (r.rating || 0), 0) / dayReports.length
                : 0;
            dailyEfficiencyAndRatings.push({
                date: date.toISOString(),
                efficiency: parseFloat(dailyEff.toFixed(1)),
                rating: parseFloat(avgRating.toFixed(1)),
                hours: parseFloat(hours.toFixed(1))
            });
            totalEfficiency += dailyEff;
        }
        const avgEfficiency = dailyEfficiencyAndRatings.length > 0
            ? totalEfficiency / dailyEfficiencyAndRatings.length
            : 100;
        const total = reports.reduce((acc, r) => acc + (r.rating || 0), 0);
        const average = reports.length > 0 ? total / reports.length : 0;
        const hikeEligibility = average > 8.0 && reports.length > 0;
        return {
            period,
            startDate,
            endDate: now,
            averageRating: average,
            averageEfficiency: parseFloat(avgEfficiency.toFixed(1)),
            totalReports: reports.length,
            hikeEligibility,
            reports: dailyEfficiencyAndRatings
        };
    }
    async findAll(user) {
        if (user.role === client_1.Role.EMPLOYEE) {
            const employee = await this.prisma.employee.findUnique({ where: { userId: user.id } });
            if (!employee)
                return [];
            return this.prisma.performanceReport.findMany({
                where: { employeeId: employee.id },
                orderBy: { createdAt: 'desc' },
                include: { reviewer: { select: { email: true } } }
            });
        }
        else if (user.role === client_1.Role.ADMIN) {
            return this.prisma.performanceReport.findMany({
                where: {
                    employee: {
                        user: {
                            departmentId: user.departmentId
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                include: { employee: true, reviewer: true }
            });
        }
        else if (user.role === client_1.Role.SUPER_ADMIN) {
            return this.prisma.performanceReport.findMany({
                orderBy: { createdAt: 'desc' },
                include: { employee: true, reviewer: true }
            });
        }
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
};
exports.PerformanceService = PerformanceService;
exports.PerformanceService = PerformanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        efficiency_service_1.EfficiencyService,
        notifications_service_1.NotificationsService])
], PerformanceService);
//# sourceMappingURL=performance.service.js.map