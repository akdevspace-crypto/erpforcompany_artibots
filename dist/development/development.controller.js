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
exports.DevelopmentController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const development_service_1 = require("./development.service");
const files_service_1 = require("../files/files.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let DevelopmentController = class DevelopmentController {
    developmentService;
    filesService;
    constructor(developmentService, filesService) {
        this.developmentService = developmentService;
        this.filesService = filesService;
    }
    findAll(req) {
        return this.developmentService.findAll(req.user);
    }
    create(req, dto) {
        return this.developmentService.create(req.user, dto);
    }
    assign(req, dto) {
        return this.developmentService.assign(req.user, dto);
    }
    findAllRequests(req, status) {
        return this.developmentService.findAll(req.user, status);
    }
    updateStatus(id, body) {
        return this.developmentService.updateStatus(id, body.status, body.adminComment);
    }
    async uploadCertificate(id, req, file) {
        if (!file)
            throw new common_1.BadRequestException('File is required');
        const storedFile = await this.filesService.store(file, req.user.id);
        const storedFileId = storedFile.id;
        const fileUrl = `/files/${storedFile.id}`;
        return this.developmentService.uploadCertificate(id, fileUrl, storedFileId);
    }
    async submitPaymentUrl(id, body) {
        if (!body.paymentUrl)
            throw new common_1.BadRequestException('Payment URL is required');
        return this.developmentService.submitPaymentUrl(id, body.paymentUrl);
    }
    async markAsPaid(id) {
        return this.developmentService.markAsPaid(id);
    }
};
exports.DevelopmentController = DevelopmentController;
__decorate([
    (0, common_1.Get)('my-resources'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DevelopmentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('request'),
    (0, roles_decorator_1.Roles)('EMPLOYEE'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DevelopmentController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('assign'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DevelopmentController.prototype, "assign", null);
__decorate([
    (0, common_1.Get)('requests'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DevelopmentController.prototype, "findAllRequests", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DevelopmentController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/certificate'),
    (0, roles_decorator_1.Roles)('EMPLOYEE'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DevelopmentController.prototype, "uploadCertificate", null);
__decorate([
    (0, common_1.Put)(':id/payment-url'),
    (0, roles_decorator_1.Roles)('EMPLOYEE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DevelopmentController.prototype, "submitPaymentUrl", null);
__decorate([
    (0, common_1.Put)(':id/pay'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DevelopmentController.prototype, "markAsPaid", null);
exports.DevelopmentController = DevelopmentController = __decorate([
    (0, common_1.Controller)('development'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [development_service_1.DevelopmentService,
        files_service_1.FilesService])
], DevelopmentController);
//# sourceMappingURL=development.controller.js.map