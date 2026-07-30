import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    create(createEmployeeDto: CreateEmployeeDto, req: any, files: any): Promise<{
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
    }>;
    findAll(req: any): Promise<({
        user: {
            department: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
            } | null;
        } & {
            email: string;
            password: string;
            departmentId: string | null;
            id: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
            profileImage: string | null;
        };
    } & {
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
    })[]>;
    findMe(req: any): Promise<({
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
    } & {
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
    }) | null>;
    findOne(id: string, req: any): Promise<{
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
    } & {
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
    }>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto, req: any, files: any): Promise<{
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
    } | null>;
    remove(id: string, req: any): Promise<void>;
}
