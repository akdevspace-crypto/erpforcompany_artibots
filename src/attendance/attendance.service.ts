import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
    constructor(private prisma: PrismaService) { }

    async getTodayRecord(userId: string) {
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

    async findToday(userId: string) {
        const attendance = await this.getTodayRecord(userId);
        return attendance || { status: 'ABSENT' };
    }

    async checkIn(userId: string) {
        const existing = await this.getTodayRecord(userId);
        if (existing) {
            throw new BadRequestException('Already checked in today');
        }

        return this.prisma.attendance.create({
            data: {
                userId,
                date: new Date(),
                status: AttendanceStatus.PRESENT,
                checkIn: new Date(),
            },
        });
    }

    async checkOut(userId: string) {
        const attendance = await this.getTodayRecord(userId);

        if (!attendance) {
            throw new NotFoundException('No attendance record found for today');
        }

        return this.prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                checkOut: new Date(),
            },
        });
    }
}
