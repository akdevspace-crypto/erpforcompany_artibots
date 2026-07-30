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
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CalendarService = class CalendarService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getHolidays(start, end) {
        return this.prisma.calendarEvent.findMany({
            where: {
                date: { gte: start, lte: end },
                type: { in: ['HOLIDAY', 'SHUTDOWN'] },
            },
        });
    }
    async isHoliday(date) {
        const formattedDate = new Date(date);
        formattedDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(formattedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const event = await this.prisma.calendarEvent.findFirst({
            where: {
                date: { gte: formattedDate, lt: nextDay },
                type: { in: ['HOLIDAY', 'SHUTDOWN'] },
            },
        });
        return !!event;
    }
    async seedHolidays(year) {
        const holidays = [
            { date: new Date(year, 0, 1), title: 'New Year' },
            { date: new Date(year, 0, 26), title: 'Republic Day' },
            { date: new Date(year, 7, 15), title: 'Independence Day' },
            { date: new Date(year, 9, 2), title: 'Gandhi Jayanti' },
            { date: new Date(year, 11, 25), title: 'Christmas' },
        ];
        for (const h of holidays) {
            const exists = await this.isHoliday(h.date);
            if (!exists) {
                await this.prisma.calendarEvent.create({
                    data: {
                        title: h.title,
                        date: h.date,
                        type: 'HOLIDAY'
                    }
                });
            }
        }
    }
};
exports.CalendarService = CalendarService;
exports.CalendarService = CalendarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CalendarService);
//# sourceMappingURL=calendar.service.js.map