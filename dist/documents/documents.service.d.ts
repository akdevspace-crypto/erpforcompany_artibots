import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateDocumentDto, uploader: any, fileUrl?: string, storedFileId?: string): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.DocumentType;
        title: string;
        fileUrl: string | null;
        employeeId: string;
        storedFileId: string | null;
        uploadedByUserId: string;
    }>;
    findAllByEmployee(employeeId: string, user: any): Promise<({
        uploadedBy: {
            email: string;
            role: import(".prisma/client").$Enums.Role;
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
    })[]>;
    findCompanyLegalDocuments(): Promise<{
        id: string;
        title: string;
        category: string;
        fileUrl: string;
        uploadedAt: Date;
    }[]>;
    findGovernmentDocuments(): Promise<({
        id: string;
        title: string;
        category: string;
        fileUrl: string;
        uploadedAt: Date;
        expiryDate: Date;
    } | {
        id: string;
        title: string;
        category: string;
        fileUrl: string;
        uploadedAt: Date;
        expiryDate: null;
    })[]>;
    createCompanyLegalDocument(title: string, category: string, fileUrl: string | undefined, storedFileId: string | undefined, uploaderId: string): Promise<{
        id: string;
        title: string;
        category: string;
        fileUrl: string | undefined;
        storedFileId: string | undefined;
        uploadedBy: string;
        uploadedAt: Date;
    }>;
    createGovernmentDocument(title: string, category: string, fileUrl: string | undefined, storedFileId: string | undefined, uploaderId: string): Promise<{
        id: string;
        title: string;
        category: string;
        fileUrl: string | undefined;
        storedFileId: string | undefined;
        uploadedBy: string;
        uploadedAt: Date;
        expiryDate: null;
    }>;
}
