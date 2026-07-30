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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const files_service_1 = require("../files/files.service");
const client_1 = require("@prisma/client");
let ProjectsService = class ProjectsService {
    prisma;
    filesService;
    constructor(prisma, filesService) {
        this.prisma = prisma;
        this.filesService = filesService;
    }
    async createProject(userId, data, file) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== client_1.Role.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Only Super Admin can create projects');
        }
        let fileData = {};
        if (file) {
            const storedFile = await this.filesService.store(file, userId, 'TASK_ATTACHMENT');
            fileData = {
                fileUrl: `/files/public/${storedFile.id}`,
                storedFileId: storedFile.id
            };
        }
        return this.prisma.project.create({
            data: {
                title: data.title,
                description: data.description,
                deadline: data.deadline,
                seniorManagerId: data.seniorManagerId,
                ...fileData
            },
        });
    }
    async assignSeniorManager(userId, projectId, seniorManagerId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== client_1.Role.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Only Super Admin can assign Senior Managers');
        }
        const senior = await this.prisma.user.findUnique({ where: { id: seniorManagerId } });
        if (!senior || senior.role !== client_1.Role.SENIOR_MANAGER) {
            throw new common_1.BadRequestException('User is not a Senior Manager');
        }
        return this.prisma.project.update({
            where: { id: projectId },
            data: { seniorManagerId },
        });
    }
    async assignProjectManager(userId, projectId, projectManagerId) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (project.seniorManagerId !== userId) {
            const caller = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!caller || caller.role !== client_1.Role.SUPER_ADMIN) {
                throw new common_1.ForbiddenException('Not authorized to assign PM for this project');
            }
        }
        const pm = await this.prisma.user.findUnique({ where: { id: projectManagerId } });
        if (!pm || pm.role !== client_1.Role.PROJECT_MANAGER) {
            throw new common_1.BadRequestException('User is not a Project Manager');
        }
        return this.prisma.project.update({
            where: { id: projectId },
            data: { projectManagerId },
        });
    }
    async selectDepartments(userId, projectId, departmentIds) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (project.projectManagerId !== userId) {
            const caller = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!caller || (caller.role !== client_1.Role.SUPER_ADMIN && project.seniorManagerId !== userId)) {
                throw new common_1.ForbiddenException('Only Project Manager can select departments');
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const promises = departmentIds.map(async (deptId) => {
                const exists = await tx.projectDepartment.findUnique({
                    where: { projectId_departmentId: { projectId, departmentId: deptId } }
                });
                if (!exists) {
                    return tx.projectDepartment.create({
                        data: { projectId, departmentId: deptId }
                    });
                }
            });
            await Promise.all(promises);
        });
    }
    async assignEmployees(userId, projectId, departmentId, employeeIds) {
        const caller = await this.prisma.user.findUnique({ where: { id: userId }, include: { department: true } });
        if (!caller)
            throw new common_1.ForbiddenException('User not found');
        if (caller.departmentId !== departmentId || caller.role !== client_1.Role.DEPARTMENT_MANAGER) {
            if (caller.role !== client_1.Role.SUPER_ADMIN && caller.role !== client_1.Role.ADMIN) {
                throw new common_1.ForbiddenException('Only Department Admin can assign employees');
            }
        }
        let team = await this.prisma.team.findFirst({
            where: { projectId, departmentId }
        });
        if (!team) {
            team = await this.prisma.team.create({
                data: {
                    name: `Project Team - ${departmentId}`,
                    projectId,
                    departmentId,
                    createdByUserId: userId
                }
            });
        }
        const ops = employeeIds.map(empId => {
            return this.prisma.teamMember.create({
                data: {
                    teamId: team.id,
                    employeeId: empId,
                    role: 'MEMBER'
                }
            }).catch(e => { });
        });
        await Promise.all(ops);
        return team;
    }
    async uploadReport(userId, projectId, data) {
        const employee = await this.prisma.employee.findUnique({ where: { userId } });
        if (!employee)
            throw new common_1.ForbiddenException('Not an employee');
        return this.prisma.projectReport.create({
            data: {
                projectId,
                employeeId: employee.id,
                title: data.title,
                content: data.content,
                fileUrl: data.fileUrl,
                status: client_1.ReportStatus.PENDING
            }
        });
    }
    async verifyReport(userId, reportId, status) {
        const report = await this.prisma.projectReport.findUnique({
            where: { id: reportId },
            include: { project: true, employee: { include: { user: { include: { department: true } } } } }
        });
        if (!report)
            throw new common_1.NotFoundException('Report not found');
        const caller = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!caller)
            throw new common_1.ForbiddenException('User not found');
        if (status === client_1.ReportStatus.VERIFIED_L1) {
            if (caller.role !== client_1.Role.DEPARTMENT_MANAGER && caller.role !== client_1.Role.SUPER_ADMIN) {
                throw new common_1.ForbiddenException('Only Department Manager can perform L1 verification');
            }
            await this.prisma.projectReport.update({
                where: { id: reportId },
                data: { status: client_1.ReportStatus.VERIFIED_L1, verifiedByL1Id: userId }
            });
        }
        else if (status === client_1.ReportStatus.VERIFIED_L2) {
            if (report.status !== client_1.ReportStatus.VERIFIED_L1) {
                throw new common_1.BadRequestException('Report must be L1 verified first');
            }
            if (caller.id !== report.project.projectManagerId && caller.role !== client_1.Role.SUPER_ADMIN) {
                throw new common_1.ForbiddenException('Only Project Manager can perform L2 verification');
            }
            await this.prisma.projectReport.update({
                where: { id: reportId },
                data: { status: client_1.ReportStatus.VERIFIED_L2, verifiedByL2Id: userId }
            });
        }
        else if (status === client_1.ReportStatus.APPROVED) {
            await this.prisma.projectReport.update({
                where: { id: reportId },
                data: { status: client_1.ReportStatus.APPROVED }
            });
        }
        else if (status === client_1.ReportStatus.REJECTED) {
            await this.prisma.projectReport.update({
                where: { id: reportId },
                data: { status: client_1.ReportStatus.REJECTED }
            });
        }
    }
    async handleTerminationAction(userId, projectId, action, data) {
        let termination = await this.prisma.projectTerminationRequest.findUnique({ where: { projectId } });
        const caller = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!caller)
            throw new common_1.ForbiddenException('User not found');
        if (!termination) {
            await this.prisma.projectTerminationRequest.create({
                data: {
                    projectId,
                    reason: data?.reason || 'Termination Requested',
                    status: client_1.TerminationStatus.PENDING_APPROVAL
                }
            });
            termination = await this.prisma.projectTerminationRequest.findUnique({ where: { projectId } });
        }
        if (!termination)
            throw new common_1.NotFoundException('Termination request creation failed');
        if (caller.role === client_1.Role.DEPARTMENT_MANAGER) {
            await this.prisma.projectTerminationRequest.update({
                where: { id: termination.id },
                data: { teamLeadApproved: true }
            });
        }
        else if (caller.role === client_1.Role.PROJECT_MANAGER) {
            await this.prisma.projectTerminationRequest.update({
                where: { id: termination.id },
                data: { pmApproved: true }
            });
        }
        else if (caller.role === client_1.Role.SENIOR_MANAGER) {
            await this.prisma.projectTerminationRequest.update({
                where: { id: termination.id },
                data: { seniorPmApproved: true }
            });
        }
        else if (caller.role === client_1.Role.HR) {
            await this.prisma.projectTerminationRequest.update({
                where: { id: termination.id },
                data: { hrApproved: true }
            });
        }
        else if (caller.role === client_1.Role.SUPER_ADMIN) {
            if (action === 'CEO_VERIFY') {
                await this.prisma.projectTerminationRequest.update({
                    where: { id: termination.id },
                    data: { ceoApproved: true, status: client_1.TerminationStatus.PENDING_CEO }
                });
            }
            else if (action === 'FINAL_APPROVE') {
                if (termination.teamLeadApproved && termination.pmApproved && termination.seniorPmApproved && termination.hrApproved && termination.ceoApproved) {
                    await this.prisma.projectTerminationRequest.update({
                        where: { id: termination.id },
                        data: { status: client_1.TerminationStatus.APPROVED }
                    });
                    await this.prisma.project.update({
                        where: { id: projectId },
                        data: { status: client_1.ProjectStatus.TERMINATED }
                    });
                }
                else {
                    throw new common_1.BadRequestException('Not all approvals met');
                }
            }
        }
        if (data?.descriptionReport) {
            await this.prisma.projectTerminationRequest.update({
                where: { id: termination.id },
                data: { descriptionReport: data.descriptionReport, isOnline: data.isOnline, proofUrl: data.proofUrl, discussionReport: data.discussionReport }
            });
        }
    }
    async getProjects(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { employee: true } });
        if (!user)
            return [];
        if (user.role === client_1.Role.SUPER_ADMIN) {
            return this.prisma.project.findMany({ include: { seniorManager: true, projectManager: true } });
        }
        if (user.role === client_1.Role.SENIOR_MANAGER) {
            return this.prisma.project.findMany({
                where: { seniorManagerId: userId },
                include: { projectManager: true }
            });
        }
        if (user.role === client_1.Role.PROJECT_MANAGER) {
            return this.prisma.project.findMany({
                where: { projectManagerId: userId },
                include: { departments: { include: { department: true } } }
            });
        }
        if (user.role === client_1.Role.DEPARTMENT_MANAGER) {
            if (!user.departmentId)
                return [];
            return this.prisma.project.findMany({
                where: { departments: { some: { departmentId: user.departmentId } } },
                include: { seniorManager: true, projectManager: true }
            });
        }
        if (user.role === client_1.Role.EMPLOYEE) {
            const employeeId = user.employee?.id;
            if (!employeeId)
                return [];
            const teams = await this.prisma.teamMember.findMany({
                where: { employeeId },
                select: { team: { select: { projectId: true } } }
            });
            const projectIds = teams.map(t => t.team.projectId).filter(Boolean);
            return this.prisma.project.findMany({
                where: { id: { in: projectIds } }
            });
        }
        return [];
    }
    async getProjectDetails(userId, projectId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { employee: true }
        });
        if (!user)
            throw new common_1.ForbiddenException('User not found');
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                seniorManager: true,
                projectManager: true,
                departments: { include: { department: true } },
                reports: { include: { employee: { include: { user: { include: { department: true } } } } } },
                terminationRequest: true,
                teams: { include: { members: { include: { employee: true } } } }
            }
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (user.role === client_1.Role.SUPER_ADMIN) {
            return project;
        }
        if (user.role === client_1.Role.SENIOR_MANAGER && project.seniorManagerId === userId) {
            return project;
        }
        if (user.role === client_1.Role.PROJECT_MANAGER && project.projectManagerId === userId) {
            return project;
        }
        if (user.role === client_1.Role.DEPARTMENT_MANAGER) {
            const isDeptAssigned = project.departments.some(pd => pd.departmentId === user.departmentId);
            if (isDeptAssigned)
                return project;
        }
        if (user.role === client_1.Role.EMPLOYEE) {
            const isTeamMember = project.teams.some(team => team.members.some(member => member.employeeId === user.employee?.id));
            if (isTeamMember)
                return project;
        }
        throw new common_1.ForbiddenException('You do not have permission to view this project.');
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        files_service_1.FilesService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map