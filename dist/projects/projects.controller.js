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
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const projects_service_1 = require("./projects.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const projects_dto_1 = require("./dto/projects.dto");
let ProjectsController = class ProjectsController {
    projectsService;
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    createProject(req, dto, file) {
        return this.projectsService.createProject(req.user.id, dto, file);
    }
    getProjects(req) {
        return this.projectsService.getProjects(req.user.id);
    }
    getProjectDetails(req, projectId) {
        return this.projectsService.getProjectDetails(req.user.id, projectId);
    }
    assignSeniorManager(req, projectId, dto) {
        return this.projectsService.assignSeniorManager(req.user.id, projectId, dto.seniorManagerId);
    }
    assignProjectManager(req, projectId, dto) {
        return this.projectsService.assignProjectManager(req.user.id, projectId, dto.projectManagerId);
    }
    selectDepartments(req, projectId, dto) {
        return this.projectsService.selectDepartments(req.user.id, projectId, dto.departmentIds);
    }
    assignEmployees(req, projectId, departmentId, body) {
        return this.projectsService.assignEmployees(req.user.id, projectId, departmentId, body.employeeIds);
    }
    uploadReport(req, projectId, dto) {
        return this.projectsService.uploadReport(req.user.id, projectId, dto);
    }
    verifyReport(req, reportId, body) {
        return this.projectsService.verifyReport(req.user.id, reportId, body.status);
    }
    handleTermination(req, projectId, body) {
        return this.projectsService.handleTerminationAction(req.user.id, projectId, body.action, body.data);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, projects_dto_1.CreateProjectDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "createProject", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "getProjects", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "getProjectDetails", null);
__decorate([
    (0, common_1.Put)(':id/senior-manager'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, projects_dto_1.AssignSeniorManagerDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "assignSeniorManager", null);
__decorate([
    (0, common_1.Put)(':id/project-manager'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, projects_dto_1.AssignProjectManagerDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "assignProjectManager", null);
__decorate([
    (0, common_1.Post)(':id/departments'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, projects_dto_1.SelectDepartmentsDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "selectDepartments", null);
__decorate([
    (0, common_1.Post)(':id/departments/:deptId/employees'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('deptId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "assignEmployees", null);
__decorate([
    (0, common_1.Post)(':id/reports'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, projects_dto_1.CreateReportDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "uploadReport", null);
__decorate([
    (0, common_1.Patch)('reports/:reportId/verify'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('reportId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "verifyReport", null);
__decorate([
    (0, common_1.Post)(':id/termination'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "handleTermination", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, common_1.Controller)('projects'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map