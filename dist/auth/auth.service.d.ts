import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterSuperAdminDto } from './dto/register-super-admin.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            departmentId: string | null;
            employee: {
                firstName: string;
                lastName: string;
                gender: import(".prisma/client").$Enums.Gender;
                phone: string | null;
                address: string | null;
                emergencyContact: string | null;
                permanentAddress: string | null;
                jobTitle: string | null;
                salary: number | null;
                joinDate: Date | null;
                dob: Date | null;
                bloodGroup: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                managerId: string | null;
                shiftEndTime: string | null;
            } | null;
            department: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
            } | null;
        };
    }>;
    registerSuperAdmin(dto: RegisterSuperAdminDto): Promise<{
        email: string;
        password: string;
        departmentId: string | null;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
        profileImage: string | null;
    }>;
    registerAdmin(dto: RegisterAdminDto, files?: {
        insurance?: Express.Multer.File[];
        pf?: Express.Multer.File[];
        personal?: Express.Multer.File[];
        educational?: Express.Multer.File[];
        profilePicture?: Express.Multer.File[];
    }, creatorUserId?: string): Promise<{
        user: {
            email: string;
            password: string;
            departmentId: string | null;
            id: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
            profileImage: string | null;
        };
        employee: {
            firstName: string;
            lastName: string;
            gender: import(".prisma/client").$Enums.Gender;
            phone: string | null;
            address: string | null;
            emergencyContact: string | null;
            permanentAddress: string | null;
            jobTitle: string | null;
            salary: number | null;
            joinDate: Date | null;
            dob: Date | null;
            bloodGroup: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            managerId: string | null;
            shiftEndTime: string | null;
        };
    }>;
    registerEmployee(dto: RegisterEmployeeDto, creatorDepartmentId?: string, files?: {
        insurance?: Express.Multer.File[];
        pf?: Express.Multer.File[];
        personal?: Express.Multer.File[];
        educational?: Express.Multer.File[];
        profilePicture?: Express.Multer.File[];
    }, creatorUserId?: string): Promise<{
        user: {
            email: string;
            password: string;
            departmentId: string | null;
            id: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
            profileImage: string | null;
        };
        employee: {
            firstName: string;
            lastName: string;
            gender: import(".prisma/client").$Enums.Gender;
            phone: string | null;
            address: string | null;
            emergencyContact: string | null;
            permanentAddress: string | null;
            jobTitle: string | null;
            salary: number | null;
            joinDate: Date | null;
            dob: Date | null;
            bloodGroup: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            managerId: string | null;
            shiftEndTime: string | null;
        };
    }>;
}
