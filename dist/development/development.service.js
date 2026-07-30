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
exports.DevelopmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let DevelopmentService = class DevelopmentService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async findAll(user, status) {
        if (user.role === 'EMPLOYEE') {
            const employee = await this.prisma.employee.findUnique({ where: { userId: user.id } });
            if (!employee)
                return [];
            return this.prisma.learningResource.findMany({
                where: { employeeId: employee.id },
                orderBy: { createdAt: 'desc' },
            });
        }
        else {
            const whereClause = {};
            if (status === 'PURCHASED') {
                whereClause.status = { in: ['ASSIGNED', 'APPROVED', 'IN_PROGRESS'] };
            }
            else if (status === 'REQUESTED') {
                whereClause.status = 'REQUESTED';
            }
            else if (status === 'COMPLETED') {
                whereClause.status = 'COMPLETED';
            }
            else if (status === 'PROOF') {
                whereClause.status = 'COMPLETED';
                whereClause.certificateUrl = { not: null };
            }
            else {
                whereClause.status = 'REQUESTED';
            }
            return this.prisma.learningResource.findMany({
                where: whereClause,
                include: { employee: { include: { user: { include: { department: true } } } } },
                orderBy: { createdAt: 'desc' },
            });
        }
    }
    generateTokenId() {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `REQ-${date}-${random}`;
    }
    async create(user, dto) {
        const employee = await this.prisma.employee.findUnique({ where: { userId: user.id } });
        if (!employee)
            throw new Error('Employee not found');
        return this.prisma.learningResource.create({
            data: {
                employeeId: employee.id,
                title: dto.title,
                description: dto.description || '',
                type: dto.type,
                url: dto.url,
                cost: dto.cost,
                justification: dto.justification,
                status: 'REQUESTED',
                tokenId: this.generateTokenId(),
                paymentStatus: 'PENDING'
            }
        });
    }
    async assign(adminUser, dto) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: dto.employeeId },
            include: { user: true }
        });
        if (!employee)
            throw new Error('Employee not found');
        const resource = await this.prisma.learningResource.create({
            data: {
                employeeId: dto.employeeId,
                title: dto.title,
                description: dto.description || 'Assigned by Admin',
                type: dto.type,
                url: dto.url,
                cost: dto.cost,
                status: 'ASSIGNED',
                tokenId: this.generateTokenId(),
                paymentStatus: 'PENDING',
                adminComment: `Assigned by ${adminUser.firstName} ${adminUser.lastName}`
            }
        });
        await this.notificationsService.createAndBroadcast([employee.userId], 'COURSE_ASSIGNED', resource.id, {
            title: 'New Course Assigned',
            message: `You have been assigned a new course: ${dto.title}`,
            courseTitle: dto.title
        });
        const admins = await this.prisma.user.findMany({
            where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
            select: { id: true }
        });
        if (admins.length > 0) {
            await this.notificationsService.createAndBroadcast(admins.map(a => a.id), 'FINANCE_PAYMENT_REQUEST', resource.id, {
                title: 'Course Cost Approval Needed',
                message: `Course "${dto.title}" assigned to ${employee.firstName}. Cost: ₹${dto.cost}. Please process payment.`,
                cost: dto.cost
            });
        }
        return resource;
    }
    async updateStatus(id, status, adminComment) {
        return this.prisma.learningResource.update({
            where: { id },
            data: { status, adminComment }
        });
    }
    async submitPaymentUrl(id, paymentUrl) {
        return this.prisma.learningResource.update({
            where: { id },
            data: { paymentUrl }
        });
    }
    async markAsPaid(id) {
        const resource = await this.prisma.learningResource.update({
            where: { id },
            data: { paymentStatus: 'PAID' },
            include: { employee: true }
        });
        if (resource.employee?.userId) {
            await this.notificationsService.createAndBroadcast([resource.employee.userId], 'COURSE_PURCHASED', resource.id, {
                title: 'Course Purchase Confirmed',
                message: `Your course "${resource.title}" has been purchased by Finance. You can now access it.`
            });
        }
        const admins = await this.prisma.user.findMany({
            where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
            select: { id: true }
        });
        const adminIds = admins.map(a => a.id);
        if (adminIds.length > 0) {
            await this.notificationsService.createAndBroadcast(adminIds, 'COURSE_PURCHASED_ADMIN', resource.id, {
                title: 'Course Payment Completed',
                message: `Payment for "${resource.title}" (Employee: ${resource.employee?.firstName} ${resource.employee?.lastName}) has been processed.`
            });
        }
        return resource;
    }
    async uploadCertificate(id, fileUrl, storedFileId) {
        return this.prisma.learningResource.update({
            where: { id },
            data: {
                certificateUrl: fileUrl,
                storedFileId,
                status: 'COMPLETED'
            }
        });
    }
};
exports.DevelopmentService = DevelopmentService;
exports.DevelopmentService = DevelopmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], DevelopmentService);
//# sourceMappingURL=development.service.js.map