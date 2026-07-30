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
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TeamsService = class TeamsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, userId, role, departmentId) {
        if (role === client_1.Role.ADMIN || role === client_1.Role.DEPARTMENT_MANAGER) {
            if (data.departmentId !== departmentId) {
                throw new common_1.ForbiddenException('Admins can only create teams in their own department');
            }
        }
        const project = await this.prisma.project.findUnique({
            where: { id: data.projectId },
            include: { departments: true }
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if ((role === client_1.Role.ADMIN || role === client_1.Role.DEPARTMENT_MANAGER) && departmentId) {
            const isAssigned = project.departments.some(pd => pd.departmentId === departmentId);
            if (!isAssigned) {
                throw new common_1.ForbiddenException('Project is not assigned to your department');
            }
        }
        return this.prisma.team.create({
            data: {
                name: data.name,
                projectId: data.projectId,
                departmentId: data.departmentId,
                createdByUserId: userId,
            },
            include: {
                project: true,
                department: true
            }
        });
    }
    async findAllByUserId(userId) {
        const member = await this.prisma.employee.findUnique({ where: { userId } });
        if (!member)
            return [];
        return this.prisma.team.findMany({
            where: {
                members: {
                    some: {
                        employeeId: member.id
                    }
                }
            },
            include: {
                project: true,
                department: { select: { name: true } }
            }
        });
    }
    async findOne(id, user) {
        const team = await this.prisma.team.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        employee: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                jobTitle: true,
                                userId: true,
                            }
                        }
                    }
                },
                project: true
            }
        });
        if (!team)
            throw new common_1.NotFoundException('Team not found');
        const isMember = team.members.some(m => m.employee.userId === user.id);
        const userEmployee = await this.prisma.employee.findUnique({ where: { userId: user.id } });
        const isActuallyMember = userEmployee ? team.members.some(m => m.employeeId === userEmployee.id) : false;
        const isDeptAdmin = (user.role === client_1.Role.ADMIN || user.role === client_1.Role.DEPARTMENT_MANAGER) && user.departmentId === team.departmentId;
        const isSuperAdmin = user.role === client_1.Role.SUPER_ADMIN;
        const isProjectManager = user.role === client_1.Role.PROJECT_MANAGER && team.project.projectManagerId === user.id;
        if (!isActuallyMember && !isDeptAdmin && !isSuperAdmin && !isProjectManager) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return team;
    }
    async addMember(teamId, employeeId, currentUser) {
        return this.prisma.teamMember.create({
            data: {
                teamId,
                employeeId
            }
        });
    }
    async removeMember(teamId, memberId, currentUser) {
        return this.prisma.teamMember.delete({
            where: { id: memberId }
        });
    }
    async findMessages(teamId, userId) {
        return this.prisma.teamMessage.findMany({
            where: { teamId },
            include: {
                sender: {
                    include: {
                        employee: {
                            select: { firstName: true, lastName: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
    }
    async sendMessage(teamId, userId, content, attachmentUrl) {
        return this.prisma.teamMessage.create({
            data: {
                teamId,
                senderUserId: userId,
                body: content,
                attachmentUrl
            }
        });
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeamsService);
//# sourceMappingURL=teams.service.js.map