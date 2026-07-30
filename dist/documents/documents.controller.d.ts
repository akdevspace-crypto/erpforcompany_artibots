import { DocumentsService } from './documents.service';
import { FilesService } from '../files/files.service';
import { CreateDocumentDto } from './dto/create-document.dto';
export declare class DocumentsController {
    private readonly documentsService;
    private readonly filesService;
    constructor(documentsService: DocumentsService, filesService: FilesService);
    create(createDocumentDto: CreateDocumentDto, req: any, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.DocumentType;
        title: string;
        fileUrl: string | null;
        employeeId: string;
        storedFileId: string | null;
        uploadedByUserId: string;
    }>;
    findAllByEmployee(employeeId: string, req: any): Promise<({
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
    uploadCompanyLegalDocument(body: {
        title: string;
        category: string;
    }, req: any, file: Express.Multer.File): Promise<{
        id: string;
        title: string;
        category: string;
        fileUrl: string | undefined;
        storedFileId: string | undefined;
        uploadedBy: string;
        uploadedAt: Date;
    }>;
    uploadGovernmentDocument(body: {
        title: string;
        category: string;
    }, req: any, file: Express.Multer.File): Promise<{
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
