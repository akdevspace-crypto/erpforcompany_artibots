import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { CreateProjectDto, CreateReportDto, TerminationRequestDto } from './dto/projects.dto';
import { ReportStatus } from '@prisma/client';
export declare class ProjectsService {
    private readonly prisma;
    private readonly filesService;
    constructor(prisma: PrismaService, filesService: FilesService);
    createProject(userId: string, data: CreateProjectDto, file?: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fileUrl: string | null;
        storedFileId: string | null;
        description: string | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        seniorManagerId: string | null;
        deadline: Date | null;
        projectManagerId: string | null;
    }>;
    assignSeniorManager(userId: string, projectId: string, seniorManagerId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fileUrl: string | null;
        storedFileId: string | null;
        description: string | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        seniorManagerId: string | null;
        deadline: Date | null;
        projectManagerId: string | null;
    }>;
    assignProjectManager(userId: string, projectId: string, projectManagerId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fileUrl: string | null;
        storedFileId: string | null;
        description: string | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        seniorManagerId: string | null;
        deadline: Date | null;
        projectManagerId: string | null;
    }>;
    selectDepartments(userId: string, projectId: string, departmentIds: string[]): Promise<void>;
    assignEmployees(userId: string, projectId: string, departmentId: string, employeeIds: string[]): Promise<{
        departmentId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        createdByUserId: string;
        projectId: string;
    }>;
    uploadReport(userId: string, projectId: string, data: CreateReportDto): Promise<{
        id: string;
        updatedAt: Date;
        title: string;
        fileUrl: string | null;
        employeeId: string;
        status: import(".prisma/client").$Enums.ReportStatus;
        submittedAt: Date;
        content: string;
        projectId: string;
        verifiedByL1Id: string | null;
        verifiedByL2Id: string | null;
        l1Status: import(".prisma/client").$Enums.ReportStatus;
        l2Status: import(".prisma/client").$Enums.ReportStatus;
        l1Comment: string | null;
        l2Comment: string | null;
        verifiedByL1UserId: string | null;
        verifiedByL2UserId: string | null;
    }>;
    verifyReport(userId: string, reportId: string, status: ReportStatus): Promise<void>;
    handleTerminationAction(userId: string, projectId: string, action: string, data?: TerminationRequestDto): Promise<void>;
    getProjects(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fileUrl: string | null;
        storedFileId: string | null;
        description: string | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        seniorManagerId: string | null;
        deadline: Date | null;
        projectManagerId: string | null;
    }[]>;
    getProjectDetails(userId: string, projectId: string): Promise<{
        teams: ({
            members: ({
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
                id: string;
                role: import(".prisma/client").$Enums.TeamRole;
                createdAt: Date;
                employeeId: string;
                teamId: string;
            })[];
        } & {
            departmentId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            createdByUserId: string;
            projectId: string;
        })[];
        departments: ({
            department: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
            };
        } & {
            departmentId: string;
            id: string;
            projectId: string;
            assignedAt: Date;
        })[];
        seniorManager: {
            email: string;
            password: string;
            departmentId: string | null;
            id: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
            profileImage: string | null;
        } | null;
        projectManager: {
            email: string;
            password: string;
            departmentId: string | null;
            id: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
            profileImage: string | null;
        } | null;
        reports: ({
            employee: {
                user: {
                    department: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        name: string;
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
        } & {
            id: string;
            updatedAt: Date;
            title: string;
            fileUrl: string | null;
            employeeId: string;
            status: import(".prisma/client").$Enums.ReportStatus;
            submittedAt: Date;
            content: string;
            projectId: string;
            verifiedByL1Id: string | null;
            verifiedByL2Id: string | null;
            l1Status: import(".prisma/client").$Enums.ReportStatus;
            l2Status: import(".prisma/client").$Enums.ReportStatus;
            l1Comment: string | null;
            l2Comment: string | null;
            verifiedByL1UserId: string | null;
            verifiedByL2UserId: string | null;
        })[];
        terminationRequest: {
            id: string;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TerminationStatus;
            reason: string;
            requestedAt: Date;
            projectId: string;
            teamLeadApproved: boolean;
            pmApproved: boolean;
            seniorPmApproved: boolean;
            hrApproved: boolean;
            ceoApproved: boolean;
            descriptionReport: string | null;
            isOnline: boolean | null;
            proofUrl: string | null;
            discussionReport: string | null;
            pkStatus: import(".prisma/client").$Enums.TerminationStatus;
            smStatus: import(".prisma/client").$Enums.TerminationStatus;
            hrStatus: import(".prisma/client").$Enums.TerminationStatus;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fileUrl: string | null;
        storedFileId: string | null;
        description: string | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        seniorManagerId: string | null;
        deadline: Date | null;
        projectManagerId: string | null;
    }>;
}
