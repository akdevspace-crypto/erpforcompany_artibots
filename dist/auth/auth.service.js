"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async login(loginDto) {
        console.log('Login attempt for:', loginDto.email);
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
            include: {
                employee: true,
                department: true
            }
        });
        if (!user) {
            console.log('User not found');
            throw new common_1.UnauthorizedException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        console.log('Password valid:', isPasswordValid);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Password invalid');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            departmentId: user.departmentId
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                departmentId: user.departmentId,
                employee: user.employee,
                department: user.department
            }
        };
    }
    async registerSuperAdmin(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        let department = await this.prisma.department.findUnique({ where: { name: dto.departmentName } });
        if (!department) {
            department = await this.prisma.department.create({ data: { name: dto.departmentName } });
        }
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                role: client_1.Role.SUPER_ADMIN,
                departmentId: department?.id,
            },
        });
        await this.prisma.employee.create({
            data: {
                userId: user.id,
                firstName: dto.firstName,
                lastName: dto.lastName,
                gender: dto.gender,
                phone: '0000000000',
                address: 'HQ',
                jobTitle: 'Super Admin',
            }
        });
        return user;
    }
    async registerAdmin(dto, files, creatorUserId) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Email already exists');
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        let department = await this.prisma.department.findUnique({ where: { name: dto.departmentName } });
        if (!department) {
            department = await this.prisma.department.create({ data: { name: dto.departmentName } });
        }
        return this.prisma.$transaction(async (prisma) => {
            const profilePicFile = files?.profilePicture?.[0];
            const profileImageUrl = profilePicFile ? `/uploads/${profilePicFile.originalname}` : undefined;
            const user = await prisma.user.create({
                data: {
                    email: dto.email,
                    password: hashedPassword,
                    role: client_1.Role.ADMIN,
                    departmentId: department.id,
                    profileImage: profileImageUrl,
                },
            });
            const employee = await prisma.employee.create({
                data: {
                    userId: user.id,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    gender: dto.gender,
                    phone: dto.phone,
                    address: dto.address,
                    jobTitle: dto.jobTitle,
                    salary: dto.salary ? parseFloat(dto.salary) : undefined,
                    joinDate: dto.joinDate ? new Date(dto.joinDate) : undefined,
                    dob: dto.dob ? new Date(dto.dob) : undefined,
                    bloodGroup: dto.bloodGroup,
                }
            });
            if (files && creatorUserId) {
                const fileTypes = [
                    { key: 'insurance', type: client_1.DocumentType.INSURANCE },
                    { key: 'pf', type: client_1.DocumentType.PF },
                    { key: 'personal', type: client_1.DocumentType.PERSONAL },
                    { key: 'educational', type: client_1.DocumentType.EDUCATIONAL },
                ];
                for (const { key, type } of fileTypes) {
                    if (files[key] && files[key][0]) {
                        const file = files[key][0];
                        await prisma.employeeDocument.create({
                            data: {
                                employeeId: employee.id,
                                type: type,
                                title: `${type} Document`,
                                fileUrl: `/uploads/${file.originalname}`,
                                uploadedByUserId: creatorUserId,
                            }
                        });
                    }
                }
            }
            return { user, employee };
        });
    }
    async registerEmployee(dto, creatorDepartmentId, files, creatorUserId) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Email already exists');
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const departmentId = creatorDepartmentId || dto.departmentId;
        if (!departmentId) {
            throw new common_1.ConflictException('Department ID is required');
        }
        return this.prisma.$transaction(async (prisma) => {
            const profilePicFile = files?.profilePicture?.[0];
            const profileImageUrl = profilePicFile ? `/uploads/${profilePicFile.originalname}` : undefined;
            const user = await prisma.user.create({
                data: {
                    email: dto.email,
                    password: hashedPassword,
                    role: client_1.Role.EMPLOYEE,
                    departmentId: departmentId,
                    profileImage: profileImageUrl,
                }
            });
            const employee = await prisma.employee.create({
                data: {
                    userId: user.id,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    gender: dto.gender,
                    phone: dto.phone,
                    address: dto.address,
                    jobTitle: dto.jobTitle,
                    salary: dto.salary ? parseFloat(dto.salary) : undefined,
                    joinDate: dto.joinDate ? new Date(dto.joinDate) : undefined,
                    dob: dto.dob ? new Date(dto.dob) : undefined,
                    bloodGroup: dto.bloodGroup,
                }
            });
            if (files && creatorUserId) {
                const fileTypes = [
                    { key: 'insurance', type: client_1.DocumentType.INSURANCE },
                    { key: 'pf', type: client_1.DocumentType.PF },
                    { key: 'personal', type: client_1.DocumentType.PERSONAL },
                    { key: 'educational', type: client_1.DocumentType.EDUCATIONAL },
                ];
                for (const { key, type } of fileTypes) {
                    if (files[key] && files[key][0]) {
                        const file = files[key][0];
                        await prisma.employeeDocument.create({
                            data: {
                                employeeId: employee.id,
                                type: type,
                                title: `${type} Document`,
                                fileUrl: `/uploads/${file.originalname}`,
                                uploadedByUserId: creatorUserId,
                            }
                        });
                    }
                }
            }
            return { user, employee };
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map