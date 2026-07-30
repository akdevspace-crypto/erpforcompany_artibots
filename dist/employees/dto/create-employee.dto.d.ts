import { Gender } from '@prisma/client';
export declare class CreateEmployeeDto {
    firstName: string;
    lastName: string;
    gender: Gender;
    phone?: string;
    address?: string;
    jobTitle?: string;
    joinDate?: string;
    salary?: number;
    dob?: string;
    bloodGroup?: string;
    managerId?: string;
    email: string;
    password: string;
}
