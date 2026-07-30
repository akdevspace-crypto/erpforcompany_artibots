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
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const files_service_1 = require("../files/files.service");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
let EmployeesService = class EmployeesService {
    prisma;
    filesService;
    constructor(prisma, filesService) {
        this.prisma = prisma;
        this.filesService = filesService;
    }
    async create(createEmployeeDto, creatorRole, creatorDepartmentId, creatorId, files) {
        const departmentId = creatorRole === client_1.Role.ADMIN ? creatorDepartmentId : undefined;
        const dto = createEmployeeDto;
        if (dto.salary)
            dto.salary = Number(dto.salary);
        if (dto.joinDate && typeof dto.joinDate === 'string')
            dto.joinDate = new Date(dto.joinDate);
        const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10);
        return this.prisma.$transaction(async (prisma) => {
            let profileImageUrl;
            if (files && files.profilePicture && files.profilePicture[0]) {
                const file = files.profilePicture[0];
                const storedFile = await this.filesService.store(file, creatorId, client_1.FileCategory.PROFILE_PICTURE);
                profileImageUrl = `/files/public/${storedFile.id}`;
            }
            const user = await prisma.user.create({
                data: {
                    email: createEmployeeDto.email,
                    password: hashedPassword,
                    role: client_1.Role.EMPLOYEE,
                    departmentId: departmentId,
                    profileImage: profileImageUrl,
                }
            });
            const employee = await prisma.employee.create({
                data: {
                    userId: user.id,
                    firstName: createEmployeeDto.firstName,
                    lastName: createEmployeeDto.lastName,
                    gender: createEmployeeDto.gender,
                    phone: createEmployeeDto.phone,
                    address: createEmployeeDto.address,
                    jobTitle: createEmployeeDto.jobTitle,
                    joinDate: dto.joinDate,
                    salary: dto.salary,
                    managerId: createEmployeeDto.managerId,
                }
            });
            const docTypes = ['insurance', 'pf', 'personal', 'educational'];
            for (const type of docTypes) {
                if (files && files[type] && files[type][0]) {
                    const file = files[type][0];
                    const storedFile = await this.filesService.store(file, creatorId, 'EMPLOYEE_DOCUMENT');
                    await prisma.employeeDocument.create({
                        data: {
                            employeeId: employee.id,
                            uploadedByUserId: creatorId,
                            type: type.toUpperCase(),
                            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Document`,
                            fileUrl: `/files/public/${storedFile.id}`,
                            storedFileId: storedFile.id
                        }
                    });
                }
            }
            return employee;
        });
    }
    async findAll(user) {
        if (user.role === client_1.Role.SUPER_ADMIN) {
            return this.prisma.employee.findMany({ include: { user: { include: { department: true } } } });
        }
        else if (user.role === client_1.Role.ADMIN) {
            return this.prisma.employee.findMany({
                where: {
                    user: {
                        departmentId: user.departmentId
                    }
                },
                include: { user: { include: { department: true } } }
            });
        }
        return [];
    }
    async findOne(id, user) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: { user: true }
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        if (user.role === client_1.Role.ADMIN && employee.user.departmentId !== user.departmentId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (user.role === client_1.Role.EMPLOYEE && employee.userId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return employee;
    }
    async findMe(userId) {
        return this.prisma.employee.findUnique({ where: { userId }, include: { user: true } });
    }
    async update(id, updateEmployeeDto, user, files) {
        const employee = await this.prisma.employee.findUnique({ where: { id }, include: { user: true } });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        if (user.role === client_1.Role.ADMIN && employee.user.departmentId !== user.departmentId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (user.role === client_1.Role.EMPLOYEE && employee.userId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const { email, password, departmentId, role, ...employeeData } = updateEmployeeDto;
        if (employeeData.salary) {
            employeeData.salary = Number(employeeData.salary);
        }
        if (employeeData.joinDate) {
            employeeData.joinDate = new Date(employeeData.joinDate);
        }
        if (employeeData.dob) {
            employeeData.dob = new Date(employeeData.dob);
        }
        await this.prisma.employee.update({
            where: { id },
            data: employeeData,
        });
        let profileImageUrl;
        if (files && files.profilePicture && files.profilePicture[0]) {
            console.log('[EmployeesService] Found profilePicture file');
            const file = files.profilePicture[0];
            const storedFile = await this.filesService.store(file, user.id, client_1.FileCategory.PROFILE_PICTURE);
            profileImageUrl = `/files/public/${storedFile.id}`;
            console.log('[EmployeesService] Generated Profile URL:', profileImageUrl);
        }
        else {
            console.log('[EmployeesService] No profilePicture in files');
        }
        const docTypes = ['insurance', 'pf', 'personal', 'educational'];
        for (const type of docTypes) {
            if (files && files[type] && files[type][0]) {
                const file = files[type][0];
                const storedFile = await this.filesService.store(file, user.id, 'EMPLOYEE_DOCUMENT');
                await this.prisma.employeeDocument.create({
                    data: {
                        employeeId: id,
                        uploadedByUserId: user.id,
                        type: type.toUpperCase(),
                        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Document`,
                        fileUrl: `/files/public/${storedFile.id}`,
                        storedFileId: storedFile.id
                    }
                });
            }
        }
        if (email || password || departmentId || profileImageUrl || role) {
            const userData = {};
            if (email)
                userData.email = email;
            if (password)
                userData.password = await bcrypt.hash(password, 10);
            if (departmentId && user.role !== client_1.Role.EMPLOYEE)
                userData.departmentId = departmentId;
            if (role && user.role !== client_1.Role.EMPLOYEE)
                userData.role = role;
            if (profileImageUrl)
                userData.profileImage = profileImageUrl;
            if (Object.keys(userData).length > 0) {
                await this.prisma.user.update({
                    where: { id: employee.userId },
                    data: userData,
                });
            }
        }
        return this.prisma.employee.findUnique({ where: { id } });
    }
    async remove(id, user) {
        const employee = await this.prisma.employee.findUnique({ where: { id }, include: { user: true } });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        if (user.role === client_1.Role.ADMIN && employee.user.departmentId !== user.departmentId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.prisma.$transaction(async (prisma) => {
            try {
                await prisma.leaveTokenBalance.deleteMany({ where: { employeeId: id } });
            }
            catch (e) { }
            try {
                await prisma.leave.deleteMany({ where: { employeeId: id } });
            }
            catch (e) { }
            try {
                await prisma.taskSubmission.deleteMany({ where: { employeeId: id } });
            }
            catch (e) { }
            try {
                await prisma.performanceReport.deleteMany({ where: { employeeId: id } });
            }
            catch (e) { }
            try {
                await prisma.supportTicket.deleteMany({ where: { employeeId: id } });
            }
            catch (e) { }
            try {
                await prisma.employeeDocument.deleteMany({ where: { employeeId: id } });
            }
            catch (e) { }
            try {
                await prisma.taskDailyReport.deleteMany({ where: { employeeId: id } });
            }
            catch (e) { }
            try {
                await prisma.cabPassengerAssignment.deleteMany({ where: { employeeId: id } });
            }
            catch (e) { }
            try {
                await prisma.employeeLocationLog.deleteMany({ where: { employeeId: id } });
            }
            catch (e) { }
            try {
                await prisma.foodTokenBalance.deleteMany({ where: { employeeId: id } });
            }
            catch (e) { }
            try {
                await prisma.foodTransaction.deleteMany({ where: { employeeId: id } });
            }
            catch (e) { }
            try {
                await prisma.foodOrder.deleteMany({ where: { employeeId: id } });
            }
            catch (e) { }
            try {
                await prisma.learningResource.deleteMany({ where: { employeeId: id } });
            }
            catch (e) { }
            try {
                await prisma.meetingAttendance.deleteMany({ where: { employeeId: id } });
            }
            catch (e) { }
            try {
                await prisma.teamMember.deleteMany({ where: { employeeId: id } });
            }
            catch (e) { }
            try {
                const tasksToEmployee = await prisma.task.findMany({ where: { employeeId: id }, select: { id: true } });
                const taskIds = tasksToEmployee.map(t => t.id);
                if (taskIds.length > 0) {
                    await prisma.taskSubmission.deleteMany({ where: { taskId: { in: taskIds } } });
                    await prisma.taskDailyReport.deleteMany({ where: { taskId: { in: taskIds } } });
                    await prisma.task.deleteMany({ where: { id: { in: taskIds } } });
                }
            }
            catch (e) { }
            const userId = employee.userId;
            try {
                await prisma.attendance.deleteMany({ where: { userId } });
            }
            catch (e) { }
            try {
                await prisma.notification.deleteMany({ where: { userId } });
            }
            catch (e) { }
            try {
                await prisma.announcement.deleteMany({ where: { createdByUserId: userId } });
            }
            catch (e) { }
            try {
                await prisma.employeeDocument.deleteMany({ where: { uploadedByUserId: userId } });
            }
            catch (e) { }
            try {
                await prisma.cabTicket.deleteMany({ where: { userId } });
            }
            catch (e) { }
            try {
                await prisma.message.deleteMany({ where: { senderUserId: userId } });
            }
            catch (e) { }
            try {
                await prisma.teamMessage.deleteMany({ where: { senderUserId: userId } });
            }
            catch (e) { }
            try {
                await prisma.conversationParticipant.deleteMany({ where: { userId } });
            }
            catch (e) { }
            try {
                await prisma.callSession.deleteMany({ where: { OR: [{ callerUserId: userId }, { calleeUserId: userId }] } });
            }
            catch (e) { }
            try {
                await prisma.project.updateMany({ where: { seniorManagerId: userId }, data: { seniorManagerId: null } });
                await prisma.project.updateMany({ where: { projectManagerId: userId }, data: { projectManagerId: null } });
            }
            catch (e) { }
            try {
                await prisma.team.deleteMany({ where: { createdByUserId: userId } });
            }
            catch (e) { }
            try {
                const tasksByUser = await prisma.task.findMany({ where: { assignedByUserId: userId }, select: { id: true } });
                const tasksByUserIds = tasksByUser.map(t => t.id);
                if (tasksByUserIds.length > 0) {
                    await prisma.taskSubmission.deleteMany({ where: { taskId: { in: tasksByUserIds } } });
                    await prisma.taskDailyReport.deleteMany({ where: { taskId: { in: tasksByUserIds } } });
                    await prisma.task.deleteMany({ where: { id: { in: tasksByUserIds } } });
                }
            }
            catch (e) { }
            try {
                await prisma.supportTicket.updateMany({ where: { resolvedByUserId: userId }, data: { resolvedByUserId: null } });
            }
            catch (e) { }
            try {
                await prisma.performanceReport.updateMany({ where: { reviewerId: userId }, data: { reviewerId: null } });
            }
            catch (e) { }
            try {
                await prisma.taskSubmission.updateMany({ where: { reviewedByUserId: userId }, data: { reviewedByUserId: null } });
            }
            catch (e) { }
            try {
                await prisma.project.updateMany({ where: { storedFile: { uploadedByUserId: userId } }, data: { storedFileId: null, fileUrl: null } });
                await prisma.storedFile.deleteMany({ where: { uploadedByUserId: userId } });
            }
            catch (e) {
                console.log('StoredFile cleanup error (non-fatal)', e);
            }
            await prisma.employee.delete({ where: { id } });
            await prisma.user.delete({ where: { id: userId } });
        });
    }
    async upsertForUser(userId, data, user, files) {
        let employee = await this.prisma.employee.findUnique({ where: { userId } });
        if (!employee) {
            console.log(`[EmployeesService] Creating missing employee record for user ${userId}`);
            const emailName = user.email.split('@')[0];
            employee = await this.prisma.employee.create({
                data: {
                    userId,
                    firstName: 'Super',
                    lastName: 'Admin',
                    gender: 'OTHER',
                    jobTitle: 'Super Admin',
                    phone: data.phone || '',
                    address: data.address || '',
                }
            });
        }
        return this.update(employee.id, data, user, files);
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        files_service_1.FilesService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map