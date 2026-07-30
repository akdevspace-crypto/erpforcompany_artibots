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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const tasks_service_1 = require("./tasks.service");
const files_service_1 = require("../files/files.service");
const create_task_dto_1 = require("./dto/create-task.dto");
const update_task_status_dto_1 = require("./dto/update-task-status.dto");
const create_submission_dto_1 = require("./dto/create-submission.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let TasksController = class TasksController {
    tasksService;
    filesService;
    constructor(tasksService, filesService) {
        this.tasksService = tasksService;
        this.filesService = filesService;
    }
    async create(createTaskDto, req, file) {
        let fileUrl;
        let storedFileId;
        if (file) {
            const storedFile = await this.filesService.store(file, req.user.id, client_1.FileCategory.TASK_ATTACHMENT);
            storedFileId = storedFile.id;
            fileUrl = `/files/${storedFile.id}`;
            createTaskDto.fileUrl = fileUrl;
            createTaskDto.storedFileId = storedFileId;
        }
        return this.tasksService.create(createTaskDto, req.user);
    }
    findAll(req) {
        return this.tasksService.findAll(req.user);
    }
    updateStatus(id, updateTaskStatusDto, req) {
        return this.tasksService.updateStatus(id, updateTaskStatusDto, req.user);
    }
    async submitTask(id, createSubmissionDto, req, file) {
        let fileUrl;
        let storedFileId;
        if (file) {
            const storedFile = await this.filesService.store(file, req.user.id, client_1.FileCategory.TASK_SUBMISSION);
            storedFileId = storedFile.id;
            fileUrl = `/files/${storedFile.id}`;
        }
        return this.tasksService.submitTask(id, createSubmissionDto, req.user.id, fileUrl, storedFileId);
    }
    createDailyReport(id, body, req) {
        return this.tasksService.createDailyReport(id, req.user.id, body);
    }
    reviewTask(id, body, req) {
        return this.tasksService.reviewTask(id, body.status, body.reviewComment, req.user);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_task_dto_1.CreateTaskDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_task_status_dto_1.UpdateTaskStatusDto, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, roles_decorator_1.Roles)(client_1.Role.EMPLOYEE),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_submission_dto_1.CreateSubmissionDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "submitTask", null);
__decorate([
    (0, common_1.Post)(':id/daily-report'),
    (0, roles_decorator_1.Roles)(client_1.Role.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "createDailyReport", null);
__decorate([
    (0, common_1.Patch)('submissions/:id/review'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "reviewTask", null);
exports.TasksController = TasksController = __decorate([
    (0, common_1.Controller)('tasks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [tasks_service_1.TasksService,
        files_service_1.FilesService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map