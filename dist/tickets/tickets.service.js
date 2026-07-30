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
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
let TicketsService = class TicketsService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async create(dto, userId, attachmentUrl) {
        const employee = await this.prisma.employee.findUnique({ where: { userId }, include: { user: true } });
        if (!employee)
            throw new common_1.NotFoundException('Employee profile not found');
        const ticket = await this.prisma.supportTicket.create({
            data: {
                employeeId: employee.id,
                subject: dto.subject,
                description: dto.description,
                category: dto.category,
                priority: dto.priority || 'MEDIUM',
                attachmentUrl,
                status: client_1.TicketStatus.OPEN,
            }
        });
        const recipients = new Set();
        const superAdmins = await this.prisma.user.findMany({ where: { role: client_1.Role.SUPER_ADMIN } });
        superAdmins.forEach(admin => recipients.add(admin.id));
        if (dto.category === 'WELLNESS') {
            const wellnessDept = await this.prisma.department.findFirst({
                where: { name: { contains: 'Wellness', mode: 'insensitive' } }
            });
            if (wellnessDept) {
                const wellnessAdmins = await this.getAdminsForDepartment(wellnessDept.id);
                wellnessAdmins.forEach(admin => recipients.add(admin.id));
            }
        }
        else {
            if (employee.user.departmentId) {
                const employeeDeptAdmins = await this.getAdminsForDepartment(employee.user.departmentId);
                employeeDeptAdmins.forEach(admin => recipients.add(admin.id));
            }
            let targetDeptName = '';
            if (dto.category === 'IT_SUPPORT')
                targetDeptName = 'IT';
            else if (dto.category === 'HR_QUERY')
                targetDeptName = 'HR';
            else if (dto.category === 'FACILITY')
                targetDeptName = 'Facility';
            if (targetDeptName) {
                const targetDept = await this.prisma.department.findFirst({
                    where: { name: { contains: targetDeptName, mode: 'insensitive' } }
                });
                if (targetDept) {
                    const targetAdmins = await this.getAdminsForDepartment(targetDept.id);
                    targetAdmins.forEach(admin => recipients.add(admin.id));
                }
            }
        }
        const employeeName = `${employee.firstName} ${employee.lastName}`;
        await this.notificationsService.createAndBroadcast(Array.from(recipients), 'TICKET_CREATE', ticket.id, {
            title: dto.category === 'WELLNESS' ? 'New Wellness Session' : 'New Support Ticket',
            message: `${employeeName} requested: ${dto.subject}`,
            employeeName,
            category: dto.category
        });
        return ticket;
    }
    async submitReport(ticketId, content, isCritical, userId) {
        const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId }, include: { employee: { include: { user: true } } } });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        const updatedTicket = await this.prisma.supportTicket.update({
            where: { id: ticketId },
            data: {
                resolution: content,
                status: client_1.TicketStatus.RESOLVED,
                resolvedAt: new Date(),
                resolvedByUserId: userId
            }
        });
        const recipients = new Set();
        if (ticket.employee.user.departmentId) {
            const deptAdmins = await this.getAdminsForDepartment(ticket.employee.user.departmentId);
            deptAdmins.forEach(a => recipients.add(a.id));
        }
        if (isCritical) {
            const superAdmins = await this.prisma.user.findMany({ where: { role: client_1.Role.SUPER_ADMIN } });
            superAdmins.forEach(a => recipients.add(a.id));
        }
        recipients.add(ticket.employee.userId);
        await this.notificationsService.createAndBroadcast(Array.from(recipients), 'TICKET_REPLY', ticket.id, {
            title: isCritical ? 'CRITICAL: Wellness Report Flagged' : 'Wellness Session Report',
            message: isCritical
                ? `Critical concern flagged for ${ticket.employee.firstName} ${ticket.employee.lastName}`
                : `Report submitted for session: ${ticket.subject}`,
            isCritical
        });
        return updatedTicket;
    }
    async remove(id, user) {
        const ticket = await this.prisma.supportTicket.findUnique({ where: { id }, include: { employee: true } });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        if (user.role === client_1.Role.EMPLOYEE) {
            if (ticket.employee.userId !== user.id)
                throw new common_1.ForbiddenException('Access denied');
        }
        else if (user.role === client_1.Role.ADMIN) {
            const employeeUser = await this.prisma.user.findUnique({ where: { id: ticket.employee.userId } });
            if (employeeUser?.departmentId !== user.departmentId)
                throw new common_1.ForbiddenException('Access denied');
        }
        return this.prisma.supportTicket.delete({ where: { id } });
    }
    async findAll(user) {
        if (user.role === client_1.Role.EMPLOYEE) {
            const employee = await this.prisma.employee.findUnique({ where: { userId: user.id } });
            if (!employee)
                return [];
            return this.prisma.supportTicket.findMany({
                where: { employeeId: employee.id },
                orderBy: { createdAt: 'desc' }
            });
        }
        else if (user.role === client_1.Role.ADMIN) {
            const adminDept = await this.prisma.department.findUnique({ where: { id: user.departmentId } });
            const isWellnessAdmin = adminDept?.name.toLowerCase().includes('wellness');
            if (isWellnessAdmin) {
                return this.prisma.supportTicket.findMany({
                    where: { category: 'WELLNESS' },
                    orderBy: { createdAt: 'desc' },
                    include: {
                        employee: {
                            include: {
                                user: {
                                    include: {
                                        department: true
                                    }
                                }
                            }
                        }
                    }
                });
            }
            return this.prisma.supportTicket.findMany({
                where: {
                    employee: {
                        user: {
                            departmentId: user.departmentId
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    employee: {
                        include: {
                            user: {
                                include: {
                                    department: true
                                }
                            }
                        }
                    }
                }
            });
        }
        else if (user.role === client_1.Role.SUPER_ADMIN) {
            return this.prisma.supportTicket.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    employee: {
                        include: {
                            user: {
                                include: {
                                    department: true
                                }
                            }
                        }
                    }
                }
            });
        }
    }
    async updateStatus(id, dto, user) {
        const ticket = await this.prisma.supportTicket.findUnique({ where: { id }, include: { employee: true } });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        if (user.role === client_1.Role.ADMIN) {
            const employeeUser = await this.prisma.user.findUnique({ where: { id: ticket.employee.userId } });
            const adminDept = await this.prisma.department.findUnique({ where: { id: user.departmentId } });
            const isWellnessTicket = ticket.category === 'WELLNESS';
            const isWellnessAdmin = adminDept?.name ? adminDept.name.toLowerCase().includes('wellness') : false;
            if (isWellnessTicket && isWellnessAdmin) {
            }
            else {
                if (employeeUser?.departmentId !== user.departmentId)
                    throw new common_1.ForbiddenException('Access denied');
            }
        }
        const updatedTicket = await this.prisma.supportTicket.update({
            where: { id },
            data: {
                status: dto.status,
                resolution: dto.resolution,
                resolvedAt: dto.status === client_1.TicketStatus.RESOLVED ? new Date() : null,
                resolvedByUserId: user.id,
            },
            include: { employee: true }
        });
        if (user.role !== client_1.Role.EMPLOYEE) {
            await this.notificationsService.createAndBroadcast([updatedTicket.employee.userId], 'TICKET_REPLY', updatedTicket.id, {
                title: 'Ticket Updated',
                message: `Your ticket "${updatedTicket.subject}" status is now ${dto.status}`,
                status: dto.status
            });
        }
        return updatedTicket;
    }
    async getAdminsForDepartment(departmentId) {
        return this.prisma.user.findMany({
            where: {
                role: client_1.Role.ADMIN,
                departmentId
            }
        });
    }
    async getLegalStats() {
        const legalTickets = await this.prisma.supportTicket.findMany({
            where: { category: 'LEGAL' },
            include: {
                employee: {
                    include: {
                        user: {
                            include: {
                                department: true
                            }
                        }
                    }
                }
            }
        });
        const total = legalTickets.length;
        const open = legalTickets.filter(t => t.status === client_1.TicketStatus.OPEN).length;
        const inProgress = legalTickets.filter(t => t.status === client_1.TicketStatus.IN_PROGRESS).length;
        const resolved = legalTickets.filter(t => t.status === client_1.TicketStatus.RESOLVED).length;
        return {
            total,
            open,
            inProgress,
            resolved,
            tickets: legalTickets
        };
    }
    async getLegalReports() {
        return this.prisma.supportTicket.findMany({
            where: { category: 'LEGAL' },
            orderBy: { createdAt: 'desc' },
            include: {
                employee: {
                    include: {
                        user: {
                            include: {
                                department: true
                            }
                        }
                    }
                },
                resolvedBy: {
                    select: {
                        email: true,
                        role: true
                    }
                }
            }
        });
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map