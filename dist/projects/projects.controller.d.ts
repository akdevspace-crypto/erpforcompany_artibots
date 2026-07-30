import { ProjectsService } from './projects.service';
import { CreateProjectDto, AssignSeniorManagerDto, AssignProjectManagerDto, SelectDepartmentsDto, CreateReportDto, TerminationRequestDto } from './dto/projects.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    createProject(req: any, dto: CreateProjectDto, file?: Express.Multer.File): Promise<{
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
    getProjects(req: any): Promise<{
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
    getProjectDetails(req: any, projectId: string): Promise<{
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
    assignSeniorManager(req: any, projectId: string, dto: AssignSeniorManagerDto): Promise<{
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
    assignProjectManager(req: any, projectId: string, dto: AssignProjectManagerDto): Promise<{
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
    selectDepartments(req: any, projectId: string, dto: SelectDepartmentsDto): Promise<void>;
    assignEmployees(req: any, projectId: string, departmentId: string, body: {
        employeeIds: string[];
    }): Promise<{
        departmentId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        createdByUserId: string;
        projectId: string;
    }>;
    uploadReport(req: any, projectId: string, dto: CreateReportDto): Promise<{
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
    verifyReport(req: any, reportId: string, body: {
        status: string;
    }): Promise<void>;
    handleTermination(req: any, projectId: string, body: {
        action: string;
        data?: TerminationRequestDto;
    }): Promise<void>;
}
