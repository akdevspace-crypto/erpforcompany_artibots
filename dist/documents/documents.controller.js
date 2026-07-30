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
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const documents_service_1 = require("./documents.service");
const files_service_1 = require("../files/files.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const create_document_dto_1 = require("./dto/create-document.dto");
let DocumentsController = class DocumentsController {
    documentsService;
    filesService;
    constructor(documentsService, filesService) {
        this.documentsService = documentsService;
        this.filesService = filesService;
    }
    async create(createDocumentDto, req, file) {
        let fileUrl = createDocumentDto.fileUrl;
        let storedFileId;
        if (file) {
            const storedFile = await this.filesService.store(file, req.user.id);
            storedFileId = storedFile.id;
            fileUrl = `/files/${storedFile.id}`;
        }
        return this.documentsService.create(createDocumentDto, req.user, fileUrl, storedFileId);
    }
    findAllByEmployee(employeeId, req) {
        return this.documentsService.findAllByEmployee(employeeId, req.user);
    }
    findCompanyLegalDocuments() {
        return this.documentsService.findCompanyLegalDocuments();
    }
    findGovernmentDocuments() {
        return this.documentsService.findGovernmentDocuments();
    }
    async uploadCompanyLegalDocument(body, req, file) {
        let fileUrl;
        let storedFileId;
        if (file) {
            const storedFile = await this.filesService.store(file, req.user.id);
            storedFileId = storedFile.id;
            fileUrl = `/files/${storedFile.id}`;
        }
        return this.documentsService.createCompanyLegalDocument(body.title, body.category, fileUrl, storedFileId, req.user.id);
    }
    async uploadGovernmentDocument(body, req, file) {
        let fileUrl;
        let storedFileId;
        if (file) {
            const storedFile = await this.filesService.store(file, req.user.id);
            storedFileId = storedFile.id;
            fileUrl = `/files/${storedFile.id}`;
        }
        return this.documentsService.createGovernmentDocument(body.title, body.category, fileUrl, storedFileId, req.user.id);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_document_dto_1.CreateDocumentDto, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EMPLOYEE),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findAllByEmployee", null);
__decorate([
    (0, common_1.Get)('company/legal'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EMPLOYEE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findCompanyLegalDocuments", null);
__decorate([
    (0, common_1.Get)('government'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EMPLOYEE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findGovernmentDocuments", null);
__decorate([
    (0, common_1.Post)('company/legal'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "uploadCompanyLegalDocument", null);
__decorate([
    (0, common_1.Post)('government'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "uploadGovernmentDocument", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.Controller)('documents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService,
        files_service_1.FilesService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map