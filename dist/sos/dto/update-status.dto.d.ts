import { SosStatus } from '@prisma/client';
export declare class UpdateSosStatusDto {
    status: SosStatus;
    resolutionNotes?: string;
}
