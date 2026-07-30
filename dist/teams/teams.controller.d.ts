import { TeamsService } from './teams.service';
export declare class TeamsController {
    private readonly teamsService;
    constructor(teamsService: TeamsService);
    create(createTeamDto: any, req: any): Promise<{
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        };
        project: {
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
        };
    } & {
        departmentId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        createdByUserId: string;
        projectId: string;
    }>;
    findAllMyTeams(req: any): Promise<({
        department: {
            name: string;
        };
        project: {
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
        };
    } & {
        departmentId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        createdByUserId: string;
        projectId: string;
    })[]>;
    findOne(id: string, req: any): Promise<{
        project: {
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
        };
        members: ({
            employee: {
                firstName: string;
                lastName: string;
                jobTitle: string | null;
                id: string;
                userId: string;
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
    }>;
    addMember(id: string, body: {
        employeeId: string;
    }, req: any): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.TeamRole;
        createdAt: Date;
        employeeId: string;
        teamId: string;
    }>;
    removeMember(id: string, memberId: string, req: any): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.TeamRole;
        createdAt: Date;
        employeeId: string;
        teamId: string;
    }>;
    findMessages(id: string, req: any): Promise<({
        sender: {
            employee: {
                firstName: string;
                lastName: string;
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
        id: string;
        createdAt: Date;
        attachmentUrl: string | null;
        senderUserId: string;
        body: string;
        teamId: string;
    })[]>;
    sendMessage(id: string, body: {
        content: string;
        attachmentUrl?: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        attachmentUrl: string | null;
        senderUserId: string;
        body: string;
        teamId: string;
    }>;
}
