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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
let TasksService = class TasksService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async create(createTaskDto, creator) {
        const employee = await this.prisma.employee.findUnique({
            where: { id: createTaskDto.employeeId },
            include: { user: true }
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        if (creator.role === client_1.Role.ADMIN) {
            if (employee.user.departmentId !== creator.departmentId) {
                throw new common_1.ForbiddenException('Cannot assign task to employee in another department');
            }
        }
        const task = await this.prisma.task.create({
            data: {
                employeeId: createTaskDto.employeeId,
                assignedByUserId: creator.id,
                title: createTaskDto.title,
                description: createTaskDto.description,
                dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
                fileUrl: createTaskDto.fileUrl,
                storedFileId: createTaskDto.storedFileId,
                status: client_1.TaskStatus.PENDING,
                priority: createTaskDto.priority || 'MEDIUM',
            },
            include: { employee: true }
        });
        const taskWithEmployee = task;
        await this.notificationsService.createAndBroadcast([taskWithEmployee.employee.userId], 'TASK_ASSIGN', task.id, {
            title: 'New Task Assigned',
            message: `You have been assigned a new task: ${task.title}`,
            taskTitle: task.title,
            dueDate: task.dueDate
        });
        return task;
    }
    async findAll(user) {
        if (user.role === client_1.Role.EMPLOYEE) {
            const employee = await this.prisma.employee.findUnique({ where: { userId: user.id } });
            if (!employee)
                return [];
            return this.prisma.task.findMany({
                where: { employeeId: employee.id },
                orderBy: { createdAt: 'desc' },
                include: { assignedBy: { select: { email: true, employee: { select: { firstName: true, lastName: true } } } } }
            });
        }
        else if (user.role === client_1.Role.ADMIN) {
            return this.prisma.task.findMany({
                where: {
                    employee: {
                        user: {
                            departmentId: user.departmentId
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                include: { employee: true, submissions: true, dailyReports: { orderBy: { createdAt: 'desc' } } }
            });
        }
        else if (user.role === client_1.Role.SUPER_ADMIN) {
            return this.prisma.task.findMany({
                orderBy: { createdAt: 'desc' },
                include: { employee: true, submissions: true, dailyReports: { orderBy: { createdAt: 'desc' } } }
            });
        }
    }
    async updateStatus(id, updateTaskStatusDto, user) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
                employee: {
                    include: { user: true }
                }
            }
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (user.role === client_1.Role.EMPLOYEE) {
            if (task.employee.userId !== user.id)
                throw new common_1.ForbiddenException('Access denied');
        }
        else if (user.role === client_1.Role.ADMIN) {
            const employeeUser = await this.prisma.user.findUnique({ where: { id: task.employee.userId } });
            if (employeeUser?.departmentId !== user.departmentId)
                throw new common_1.ForbiddenException('Access denied');
        }
        const updatedTask = await this.prisma.task.update({
            where: { id },
            data: { status: updateTaskStatusDto.status }
        });
        if (user.role === client_1.Role.EMPLOYEE) {
            const admins = await this.prisma.user.findMany({
                where: {
                    role: client_1.Role.ADMIN,
                    departmentId: task.employee.user.departmentId
                }
            });
            const superAdmins = await this.prisma.user.findMany({
                where: { role: client_1.Role.SUPER_ADMIN }
            });
            const recipients = [...admins, ...superAdmins].map(u => u.id);
            const employeeName = `${task.employee.firstName} ${task.employee.lastName}`;
            if (recipients.length > 0) {
                await this.notificationsService.createAndBroadcast(recipients, 'TASK_STATUS_UPDATE', task.id, {
                    title: 'Task Status Updated',
                    message: `Task "${task.title}" status updated to ${updateTaskStatusDto.status} by ${employeeName}`,
                    taskTitle: task.title,
                    status: updateTaskStatusDto.status,
                    updatedBy: employeeName
                });
            }
        }
        return updatedTask;
    }
    async submitTask(taskId, createSubmissionDto, userId, fileUrl, storedFileId) {
        const task = await this.prisma.task.findUnique({ where: { id: taskId }, include: { employee: true } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (task.employee.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return this.prisma.$transaction(async (prisma) => {
            const submission = await prisma.taskSubmission.create({
                data: {
                    taskId,
                    employeeId: task.employeeId,
                    content: createSubmissionDto.content,
                    fileUrl: fileUrl || createSubmissionDto.fileUrl,
                    storedFileId
                }
            });
            await prisma.task.update({
                where: { id: taskId },
                data: { status: client_1.TaskStatus.SUBMITTED }
            });
            const creatorUser = await prisma.user.findUnique({ where: { id: task.assignedByUserId } });
            if (creatorUser) {
                await this.notificationsService.createAndBroadcast([creatorUser.id], 'TASK_SUBMIT', taskId, {
                    title: 'Task Submitted',
                    message: `${task.employee.firstName} submitted task: ${task.title}`,
                    taskTitle: task.title,
                    employeeName: `${task.employee.firstName} ${task.employee.lastName}`
                });
            }
            return submission;
        });
    }
    async createDailyReport(taskId, userId, data) {
        const task = await this.prisma.task.findUnique({ where: { id: taskId }, include: { employee: true } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (task.employee.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return this.prisma.taskDailyReport.create({
            data: {
                taskId,
                employeeId: task.employeeId,
                progress: data.progress,
                hoursSpent: data.hoursSpent,
                description: data.description
            }
        });
    }
    async reviewTask(submissionId, status, reviewComment, reviewer) {
        const submission = await this.prisma.taskSubmission.findUnique({
            where: { id: submissionId },
            include: { task: { include: { employee: { include: { user: true } } } } }
        });
        if (!submission)
            throw new common_1.NotFoundException('Submission not found');
        if (reviewer.role === client_1.Role.ADMIN) {
            if (submission.task.employee.user.departmentId !== reviewer.departmentId) {
                throw new common_1.ForbiddenException('Cannot review task for another department');
            }
        }
        return this.prisma.$transaction(async (prisma) => {
            const updatedSubmission = await prisma.taskSubmission.update({
                where: { id: submissionId },
                data: {
                    status: status,
                    reviewComment,
                    reviewedByUserId: reviewer.id
                }
            });
            let taskStatus = client_1.TaskStatus.SUBMITTED;
            if (status === 'APPROVED')
                taskStatus = client_1.TaskStatus.COMPLETED;
            else if (status === 'CHANGES_REQUESTED')
                taskStatus = client_1.TaskStatus.REOPENED;
            await prisma.task.update({
                where: { id: submission.taskId },
                data: { status: taskStatus }
            });
            await this.notificationsService.createAndBroadcast([submission.task.employee.user.id], 'TASK_REVIEW', submission.taskId, {
                title: 'Task Review Update',
                message: `Your task submission has been ${status}`,
                taskTitle: submission.task.title,
                status
            });
            return updatedSubmission;
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map