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
exports.CommunicationController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const communication_service_1 = require("./communication.service");
const files_service_1 = require("../files/files.service");
const send_message_dto_1 = require("./dto/send-message.dto");
const create_conversation_dto_1 = require("./dto/create-conversation.dto");
const create_call_dto_1 = require("./dto/create-call.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const client_1 = require("@prisma/client");
let CommunicationController = class CommunicationController {
    communicationService;
    filesService;
    constructor(communicationService, filesService) {
        this.communicationService = communicationService;
        this.filesService = filesService;
    }
    async getDirectory(req, query) {
        return this.communicationService.getDirectory(req.user, query);
    }
    async getConversations(req) {
        return this.communicationService.getConversations(req.user.id);
    }
    async startConversation(req, dto) {
        return this.communicationService.startConversation(req.user.id, dto.targetUserId);
    }
    async getMessages(req, id) {
        return this.communicationService.getMessages(id, req.user.id);
    }
    async sendMessage(req, id, dto, file) {
        if (file) {
            const storedFile = await this.filesService.store(file, req.user.id, client_1.FileCategory.CHAT_MEDIA);
            dto.fileUrl = storedFile.url || '';
            dto.fileType = storedFile.mimeType;
            dto.storedFileId = storedFile.id;
        }
        return this.communicationService.sendMessage(id, req.user.id, dto);
    }
    async editMessage(req, id, body) {
        return this.communicationService.updateMessage(id, req.user.id, body.content);
    }
    async getCallHistory(req) {
        return this.communicationService.getCallHistory(req.user.id);
    }
    async deleteCallSession(req, id) {
        if (req.user.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Only Super Admins can delete call records');
        }
        return this.communicationService.deleteCallSession(id);
    }
    async getAllCallHistory(req) {
        console.log('[CommunicationController] getAllCallHistory hit. User:', req.user);
        if (req.user.role !== 'SUPER_ADMIN') {
            console.error('[CommunicationController] Access denied. Role:', req.user.role);
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.communicationService.getAllCallHistory();
    }
    async createCallSession(req, dto) {
        return this.communicationService.createCallSession(req.user.id, dto);
    }
};
exports.CommunicationController = CommunicationController;
__decorate([
    (0, common_1.Get)('directory'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "getDirectory", null);
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Post)('conversations'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_conversation_dto_1.CreateConversationDto]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "startConversation", null);
__decorate([
    (0, common_1.Get)('conversations/:id/messages'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('conversations/:id/messages'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, send_message_dto_1.SendMessageDto, Object]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('messages/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "editMessage", null);
__decorate([
    (0, common_1.Get)('calls/history'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "getCallHistory", null);
__decorate([
    (0, common_1.Delete)('calls/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "deleteCallSession", null);
__decorate([
    (0, common_1.Get)('calls/all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "getAllCallHistory", null);
__decorate([
    (0, common_1.Post)('calls'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_call_dto_1.CreateCallDto]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "createCallSession", null);
exports.CommunicationController = CommunicationController = __decorate([
    (0, common_1.Controller)('communication'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [communication_service_1.CommunicationService,
        files_service_1.FilesService])
], CommunicationController);
//# sourceMappingURL=communication.controller.js.map