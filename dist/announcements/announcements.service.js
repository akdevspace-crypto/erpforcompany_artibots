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
exports.AnnouncementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AnnouncementsService = class AnnouncementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, creator) {
        if (creator.role === client_1.Role.ADMIN) {
            if (dto.departmentId && dto.departmentId !== creator.departmentId) {
                throw new common_1.ForbiddenException('Cannot create announcement for another department');
            }
            if (!dto.departmentId) {
                dto.departmentId = creator.departmentId;
            }
        }
        return this.prisma.announcement.create({
            data: {
                title: dto.title,
                body: dto.body,
                departmentId: dto.departmentId,
                createdByUserId: creator.id,
                mediaUrl: dto.mediaUrl,
                mediaType: dto.mediaType,
            }
        });
    }
    async findAll(user) {
        const whereClause = {
            OR: [
                { departmentId: null },
            ]
        };
        if (user.departmentId) {
            whereClause.OR.push({ departmentId: user.departmentId });
        }
        return this.prisma.announcement.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: { createdBy: { select: { email: true, role: true, employee: { select: { firstName: true, lastName: true } } } } }
        });
    }
    async update(id, data) {
        return this.prisma.announcement.update({
            where: { id },
            data: {
                title: data.title,
                body: data.body,
                mediaUrl: data.mediaUrl,
                mediaType: data.mediaType
            }
        });
    }
    async remove(id) {
        return this.prisma.announcement.delete({
            where: { id }
        });
    }
};
exports.AnnouncementsService = AnnouncementsService;
exports.AnnouncementsService = AnnouncementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnnouncementsService);
//# sourceMappingURL=announcements.service.js.map