import { SosService } from './sos.service';
import { CreateSosDto } from './dto/create-sos.dto';
import { UpdateSosLocationDto } from './dto/update-location.dto';
import { UpdateSosStatusDto } from './dto/update-status.dto';
export declare class SosController {
    private readonly sosService;
    constructor(sosService: SosService);
    create(req: any, createSosDto: CreateSosDto): Promise<{
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
    } & {
        message: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        status: import(".prisma/client").$Enums.SosStatus;
        resolvedAt: Date | null;
        source: import(".prisma/client").$Enums.SosSource;
        initialLat: number | null;
        initialLong: number | null;
        lastLat: number | null;
        lastLong: number | null;
        cabTripId: string | null;
        vehicleId: string | null;
        driverId: string | null;
    }>;
    updateLocation(id: string, updateLocationDto: UpdateSosLocationDto): Promise<{
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
    } & {
        message: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        status: import(".prisma/client").$Enums.SosStatus;
        resolvedAt: Date | null;
        source: import(".prisma/client").$Enums.SosSource;
        initialLat: number | null;
        initialLong: number | null;
        lastLat: number | null;
        lastLong: number | null;
        cabTripId: string | null;
        vehicleId: string | null;
        driverId: string | null;
    }>;
    updateStatus(id: string, updateStatusDto: UpdateSosStatusDto): Promise<{
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
    } & {
        message: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        status: import(".prisma/client").$Enums.SosStatus;
        resolvedAt: Date | null;
        source: import(".prisma/client").$Enums.SosSource;
        initialLat: number | null;
        initialLong: number | null;
        lastLat: number | null;
        lastLong: number | null;
        cabTripId: string | null;
        vehicleId: string | null;
        driverId: string | null;
    }>;
    findAll(): Promise<({
        employee: {
            user: {
                department: {
                    name: string;
                } | null;
                email: string;
                role: import(".prisma/client").$Enums.Role;
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
        };
        locationLogs: {
            id: string;
            latitude: number;
            longitude: number;
            capturedAt: Date;
            sosIncidentId: string;
        }[];
    } & {
        message: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        status: import(".prisma/client").$Enums.SosStatus;
        resolvedAt: Date | null;
        source: import(".prisma/client").$Enums.SosSource;
        initialLat: number | null;
        initialLong: number | null;
        lastLat: number | null;
        lastLong: number | null;
        cabTripId: string | null;
        vehicleId: string | null;
        driverId: string | null;
    })[]>;
}
