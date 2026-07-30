import { SosSource } from '@prisma/client';
export declare class CreateSosDto {
    source: SosSource;
    message?: string;
    latitude?: number;
    longitude?: number;
}
