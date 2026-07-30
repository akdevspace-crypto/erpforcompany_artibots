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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DocumentsService = class DocumentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, uploader, fileUrl, storedFileId) {
        if (uploader.role === client_1.Role.ADMIN) {
            const employee = await this.prisma.employee.findUnique({
                where: { id: dto.employeeId },
                include: { user: true }
            });
            if (!employee)
                throw new common_1.NotFoundException('Employee not found');
            if (employee.user.departmentId !== uploader.departmentId) {
                throw new common_1.ForbiddenException('Cannot upload documents for employee in another department');
            }
        }
        return this.prisma.employeeDocument.create({
            data: {
                employeeId: dto.employeeId,
                type: dto.type,
                title: dto.title,
                fileUrl: fileUrl || dto.fileUrl,
                storedFileId,
                uploadedByUserId: uploader.id,
            }
        });
    }
    async findAllByEmployee(employeeId, user) {
        if (user.role === client_1.Role.EMPLOYEE) {
            const myEmployee = await this.prisma.employee.findUnique({ where: { userId: user.id } });
            if (!myEmployee || myEmployee.id !== employeeId) {
                throw new common_1.ForbiddenException('Access denied');
            }
        }
        else if (user.role === client_1.Role.ADMIN) {
            const employee = await this.prisma.employee.findUnique({
                where: { id: employeeId },
                include: { user: true }
            });
            if (!employee)
                throw new common_1.NotFoundException('Employee not found');
            if (employee.user.departmentId !== user.departmentId) {
                throw new common_1.ForbiddenException('Access denied');
            }
        }
        return this.prisma.employeeDocument.findMany({
            where: { employeeId },
            orderBy: { createdAt: 'desc' },
            include: { uploadedBy: { select: { email: true, role: true } } }
        });
    }
    async findCompanyLegalDocuments() {
        return [
            { id: '1', title: 'Company Bylaws 2024', category: 'Governance', fileUrl: '/docs/bylaws.pdf', uploadedAt: new Date('2024-01-15') },
            { id: '2', title: 'Shareholder Agreement', category: 'Corporate', fileUrl: '/docs/shareholder.pdf', uploadedAt: new Date('2024-01-10') },
            { id: '3', title: 'Non-Disclosure Agreement Template', category: 'Legal', fileUrl: '/docs/nda-template.pdf', uploadedAt: new Date('2024-02-01') },
            { id: '4', title: 'Employment Contract Template', category: 'HR', fileUrl: '/docs/employment-contract.pdf', uploadedAt: new Date('2024-01-20') },
        ];
    }
    async findGovernmentDocuments() {
        return [
            { id: '1', title: 'GST Registration Certificate', category: 'Tax', fileUrl: '/docs/gst-cert.pdf', uploadedAt: new Date('2023-12-01'), expiryDate: new Date('2025-12-01') },
            { id: '2', title: 'Trade License', category: 'Business', fileUrl: '/docs/trade-license.pdf', uploadedAt: new Date('2023-11-15'), expiryDate: new Date('2024-11-15') },
            { id: '3', title: 'PF Registration', category: 'Labor', fileUrl: '/docs/pf-reg.pdf', uploadedAt: new Date('2023-10-10'), expiryDate: null },
            { id: '4', title: 'ESIC Registration', category: 'Labor', fileUrl: '/docs/esic-reg.pdf', uploadedAt: new Date('2023-10-10'), expiryDate: null },
            { id: '5', title: 'Professional Tax Registration', category: 'Tax', fileUrl: '/docs/pt-reg.pdf', uploadedAt: new Date('2023-09-01'), expiryDate: new Date('2024-09-01') },
        ];
    }
    async createCompanyLegalDocument(title, category, fileUrl, storedFileId, uploaderId) {
        return {
            id: Date.now().toString(),
            title,
            category,
            fileUrl,
            storedFileId,
            uploadedBy: uploaderId,
            uploadedAt: new Date()
        };
    }
    async createGovernmentDocument(title, category, fileUrl, storedFileId, uploaderId) {
        return {
            id: Date.now().toString(),
            title,
            category,
            fileUrl,
            storedFileId,
            uploadedBy: uploaderId,
            uploadedAt: new Date(),
            expiryDate: null
        };
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map