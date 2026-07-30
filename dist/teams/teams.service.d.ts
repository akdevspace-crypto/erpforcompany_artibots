import { PrismaService } from '../prisma/prisma.service';
export declare class TeamsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any, userId: string, role: string, departmentId?: string): Promise<{
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
    findAllByUserId(userId: string): Promise<({
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
    findOne(id: string, user: any): Promise<{
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
    addMember(teamId: string, employeeId: string, currentUser: any): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.TeamRole;
        createdAt: Date;
        employeeId: string;
        teamId: string;
    }>;
    removeMember(teamId: string, memberId: string, currentUser: any): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.TeamRole;
        createdAt: Date;
        employeeId: string;
        teamId: string;
    }>;
    findMessages(teamId: string, userId: string): Promise<({
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
    sendMessage(teamId: string, userId: string, content: string, attachmentUrl?: string): Promise<{
        id: string;
        createdAt: Date;
        attachmentUrl: string | null;
        senderUserId: string;
        body: string;
        teamId: string;
    }>;
}
