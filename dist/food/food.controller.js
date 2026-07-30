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
exports.FoodController = void 0;
const common_1 = require("@nestjs/common");
const food_service_1 = require("./food.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const client_1 = require("@prisma/client");
let FoodController = class FoodController {
    foodService;
    constructor(foodService) {
        this.foodService = foodService;
    }
    getMyBalance(req) {
        return this.foodService.getMyBalance(req.user.id);
    }
    getMyTransactions(req) {
        return this.foodService.getMyTransactions(req.user.id);
    }
    consume(req, body) {
        return this.foodService.consumeTokens(req.user.id, body.tokens || 1);
    }
    getAdminStats(req) {
        if (req.user.role !== client_1.Role.SUPER_ADMIN) {
            throw new Error('Unauthorized');
        }
        return this.foodService.getAdminStats();
    }
    getTodayOrders(req) {
        if (req.user.role !== client_1.Role.SUPER_ADMIN) {
            throw new Error('Unauthorized');
        }
        return this.foodService.getTodayOrders();
    }
    updateOrderStatus(req, orderId, body) {
        if (req.user.role !== client_1.Role.SUPER_ADMIN) {
            throw new Error('Unauthorized');
        }
        return this.foodService.updateOrderStatus(orderId, body.status);
    }
    getMenuItems(req) {
        if (req.user.role !== client_1.Role.SUPER_ADMIN) {
            throw new Error('Unauthorized');
        }
        return this.foodService.getAllMenuItems();
    }
    createMenuItem(req, body) {
        if (req.user.role !== client_1.Role.SUPER_ADMIN) {
            throw new Error('Unauthorized');
        }
        return this.foodService.createMenuItem(body);
    }
    updateMenuItem(req, itemId, body) {
        if (req.user.role !== client_1.Role.SUPER_ADMIN) {
            throw new Error('Unauthorized');
        }
        return this.foodService.updateMenuItem(itemId, body);
    }
    deleteMenuItem(req, itemId) {
        if (req.user.role !== client_1.Role.SUPER_ADMIN) {
            throw new Error('Unauthorized');
        }
        return this.foodService.deleteMenuItem(itemId);
    }
    getFoodReports(req) {
        if (req.user.role !== client_1.Role.SUPER_ADMIN) {
            throw new Error('Unauthorized');
        }
        return this.foodService.getFoodReports();
    }
};
exports.FoodController = FoodController;
__decorate([
    (0, common_1.Get)('balance'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FoodController.prototype, "getMyBalance", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FoodController.prototype, "getMyTransactions", null);
__decorate([
    (0, common_1.Post)('consume'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FoodController.prototype, "consume", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FoodController.prototype, "getAdminStats", null);
__decorate([
    (0, common_1.Get)('admin/orders/today'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FoodController.prototype, "getTodayOrders", null);
__decorate([
    (0, common_1.Put)('admin/orders/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], FoodController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Get)('admin/menu'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FoodController.prototype, "getMenuItems", null);
__decorate([
    (0, common_1.Post)('admin/menu'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FoodController.prototype, "createMenuItem", null);
__decorate([
    (0, common_1.Put)('admin/menu/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], FoodController.prototype, "updateMenuItem", null);
__decorate([
    (0, common_1.Delete)('admin/menu/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FoodController.prototype, "deleteMenuItem", null);
__decorate([
    (0, common_1.Get)('admin/reports'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FoodController.prototype, "getFoodReports", null);
exports.FoodController = FoodController = __decorate([
    (0, common_1.Controller)('food'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [food_service_1.FoodService])
], FoodController);
//# sourceMappingURL=food.controller.js.map