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
exports.PerformanceController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const performance_service_1 = require("./performance.service");
const files_service_1 = require("../files/files.service");
const create_performance_report_dto_1 = require("./dto/create-performance-report.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let PerformanceController = class PerformanceController {
    performanceService;
    filesService;
    constructor(performanceService, filesService) {
        this.performanceService = performanceService;
        this.filesService = filesService;
    }
    async create(createPerformanceReportDto, req, file) {
        let fileUrl = createPerformanceReportDto.fileUrl;
        let storedFileId;
        if (file) {
            const storedFile = await this.filesService.store(file, req.user.id);
            storedFileId = storedFile.id;
            fileUrl = `/files/${storedFile.id}`;
            createPerformanceReportDto.fileUrl = fileUrl;
        }
        return this.performanceService.create(createPerformanceReportDto, req.user, storedFileId);
    }
    update(id, body, req) {
        return this.performanceService.update(id, body, req.user);
    }
    getAnalysis(req, period) {
        return this.performanceService.getAnalysis(req.user, period || 'MONTHLY');
    }
    findAll(req) {
        return this.performanceService.findAll(req.user);
    }
};
exports.PerformanceController = PerformanceController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EMPLOYEE),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_performance_report_dto_1.CreatePerformanceReportDto, Object, Object]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('analysis'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getAnalysis", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "findAll", null);
exports.PerformanceController = PerformanceController = __decorate([
    (0, common_1.Controller)('performance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [performance_service_1.PerformanceService,
        files_service_1.FilesService])
], PerformanceController);
//# sourceMappingURL=performance.controller.js.map