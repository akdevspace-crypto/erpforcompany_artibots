import { Gender } from '@prisma/client';
export declare class RegisterEmployeeDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    gender: Gender;
    phone?: string;
    address?: string;
    jobTitle?: string;
    emergencyContact?: string;
    permanentAddress?: string;
    departmentId?: string;
    joinDate?: string;
    dob?: string;
    bloodGroup?: string;
    salary?: string;
}
