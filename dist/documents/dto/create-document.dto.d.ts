import { DocumentType } from '@prisma/client';
export declare class CreateDocumentDto {
    employeeId: string;
    type: DocumentType;
    title: string;
    fileUrl: string;
}
