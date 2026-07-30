export declare class RegisterAdminDto {
    email: string;
    password: string;
    departmentName: string;
    firstName: string;
    lastName: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    phone?: string;
    address?: string;
    emergencyContact?: string;
    permanentAddress?: string;
    jobTitle?: string;
    salary?: string;
    joinDate?: string;
    dob?: string;
    bloodGroup?: string;
}
