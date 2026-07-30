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
exports.SosController = void 0;
const common_1 = require("@nestjs/common");
const sos_service_1 = require("./sos.service");
const create_sos_dto_1 = require("./dto/create-sos.dto");
const update_location_dto_1 = require("./dto/update-location.dto");
const update_status_dto_1 = require("./dto/update-status.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let SosController = class SosController {
    sosService;
    constructor(sosService) {
        this.sosService = sosService;
    }
    create(req, createSosDto) {
        console.log('SOS Controller Request User:', req.user);
        return this.sosService.create(req.user.id, createSosDto);
    }
    updateLocation(id, updateLocationDto) {
        return this.sosService.updateLocation(id, updateLocationDto);
    }
    updateStatus(id, updateStatusDto) {
        return this.sosService.updateStatus(id, updateStatusDto.status, updateStatusDto.resolutionNotes);
    }
    findAll() {
        return this.sosService.findAll();
    }
};
exports.SosController = SosController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_sos_dto_1.CreateSosDto]),
    __metadata("design:returntype", void 0)
], SosController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/location'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_location_dto_1.UpdateSosLocationDto]),
    __metadata("design:returntype", void 0)
], SosController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_status_dto_1.UpdateSosStatusDto]),
    __metadata("design:returntype", void 0)
], SosController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)('incidents'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SosController.prototype, "findAll", null);
exports.SosController = SosController = __decorate([
    (0, common_1.Controller)('sos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [sos_service_1.SosService])
], SosController);
//# sourceMappingURL=sos.controller.js.map