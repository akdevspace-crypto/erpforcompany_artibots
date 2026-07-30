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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AttendanceService = class AttendanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTodayRecord(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.prisma.attendance.findFirst({
            where: {
                userId,
                date: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });
    }
    async findToday(userId) {
        const attendance = await this.getTodayRecord(userId);
        return attendance || { status: 'ABSENT' };
    }
    async checkIn(userId) {
        const existing = await this.getTodayRecord(userId);
        if (existing) {
            throw new common_1.BadRequestException('Already checked in today');
        }
        return this.prisma.attendance.create({
            data: {
                userId,
                date: new Date(),
                status: client_1.AttendanceStatus.PRESENT,
                checkIn: new Date(),
            },
        });
    }
    async checkOut(userId) {
        const attendance = await this.getTodayRecord(userId);
        if (!attendance) {
            throw new common_1.NotFoundException('No attendance record found for today');
        }
        return this.prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                checkOut: new Date(),
            },
        });
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map