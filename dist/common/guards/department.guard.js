"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentGuard = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let DepartmentGuard = class DepartmentGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const body = request.body;
        const params = request.params;
        if (!user)
            return false;
        if (user.role === client_1.Role.SUPER_ADMIN) {
            return true;
        }
        if (user.role === client_1.Role.ADMIN) {
            if (body.departmentId && body.departmentId !== user.departmentId) {
                throw new common_1.ForbiddenException('You can only manage resources in your department');
            }
            return true;
        }
        if (user.role === client_1.Role.EMPLOYEE) {
            return true;
        }
        return true;
    }
};
exports.DepartmentGuard = DepartmentGuard;
exports.DepartmentGuard = DepartmentGuard = __decorate([
    (0, common_1.Injectable)()
], DepartmentGuard);
//# sourceMappingURL=department.guard.js.map