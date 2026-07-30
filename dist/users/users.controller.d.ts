import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getMe(req: any): Promise<{
        firstName: string;
        lastName: string;
        jobTitle: string;
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        } | null;
        employee: ({
            documents: ({
                storedFile: {
                    id: string;
                    createdAt: Date;
                    data: Buffer | null;
                    uploadedByUserId: string;
                    filename: string;
                    mimeType: string;
                    url: string | null;
                    size: number;
                    category: import(".prisma/client").$Enums.FileCategory;
                } | null;
                uploadedBy: {
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
                id: string;
                createdAt: Date;
                type: import(".prisma/client").$Enums.DocumentType;
                title: string;
                fileUrl: string | null;
                employeeId: string;
                storedFileId: string | null;
                uploadedByUserId: string;
            })[];
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
        }) | null;
        email: string;
        password: string;
        departmentId: string | null;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
        profileImage: string | null;
    } | null>;
    findAll(req: any): Promise<({
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        } | null;
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
    } & {
        email: string;
        password: string;
        departmentId: string | null;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
        profileImage: string | null;
    })[]>;
}
