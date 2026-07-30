"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevelopmentModule = void 0;
const common_1 = require("@nestjs/common");
const development_service_1 = require("./development.service");
const development_controller_1 = require("./development.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const files_module_1 = require("../files/files.module");
const platform_express_1 = require("@nestjs/platform-express");
const notifications_module_1 = require("../notifications/notifications.module");
let DevelopmentModule = class DevelopmentModule {
};
exports.DevelopmentModule = DevelopmentModule;
exports.DevelopmentModule = DevelopmentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            files_module_1.FilesModule,
            platform_express_1.MulterModule.register(),
            notifications_module_1.NotificationsModule
        ],
        controllers: [development_controller_1.DevelopmentController],
        providers: [development_service_1.DevelopmentService],
    })
], DevelopmentModule);
//# sourceMappingURL=development.module.js.map