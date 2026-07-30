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
exports.MeetingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let MeetingsService = class MeetingsService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async create(createMeetingDto, creatorId) {
        const meeting = await this.prisma.meeting.create({
            data: {
                title: createMeetingDto.title,
                description: createMeetingDto.description,
                scheduledAt: new Date(createMeetingDto.scheduledAt),
                duration: Number(createMeetingDto.duration),
                type: createMeetingDto.type,
            }
        });
        if (createMeetingDto.participantIds && createMeetingDto.participantIds.length > 0) {
            const employees = await this.prisma.employee.findMany({
                where: { id: { in: createMeetingDto.participantIds } },
                include: { user: true }
            });
            const attendanceData = employees.map(emp => ({
                meetingId: meeting.id,
                employeeId: emp.id,
                attended: false
            }));
            await this.prisma.meetingAttendance.createMany({
                data: attendanceData
            });
            const userIds = employees.map(e => e.userId);
            if (userIds.length > 0) {
                await this.notificationsService.createAndBroadcast(userIds, 'MEETING_INVITE', meeting.id, {
                    title: 'Meeting Invitation',
                    message: `You have been invited to a meeting: ${meeting.title}`,
                    meetingTitle: meeting.title,
                    scheduledAt: meeting.scheduledAt
                });
            }
        }
        return meeting;
    }
    async findAll(date) {
        let whereClause = {};
        if (date) {
            const searchDate = new Date(date);
            searchDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(searchDate);
            nextDay.setDate(nextDay.getDate() + 1);
            whereClause.scheduledAt = {
                gte: searchDate,
                lt: nextDay
            };
        }
        return this.prisma.meeting.findMany({
            where: whereClause,
            include: {
                attendees: {
                    include: {
                        employee: {
                            select: { firstName: true, lastName: true, jobTitle: true }
                        }
                    }
                }
            },
            orderBy: { scheduledAt: 'asc' }
        });
    }
    async findOne(id) {
        return this.prisma.meeting.findUnique({
            where: { id },
            include: { attendees: { include: { employee: true } } }
        });
    }
};
exports.MeetingsService = MeetingsService;
exports.MeetingsService = MeetingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], MeetingsService);
//# sourceMappingURL=meetings.service.js.map