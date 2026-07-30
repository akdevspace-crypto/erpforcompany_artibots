import { TasksService } from './tasks.service';
import { FilesService } from '../files/files.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
export declare class TasksController {
    private readonly tasksService;
    private readonly filesService;
    constructor(tasksService: TasksService, filesService: FilesService);
    create(createTaskDto: CreateTaskDto, req: any, file: Express.Multer.File): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fileUrl: string | null;
        employeeId: string;
        storedFileId: string | null;
        assignedByUserId: string;
        description: string | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.TaskPriority;
        dueDate: Date | null;
    }>;
    findAll(req: any): Promise<({
        assignedBy: {
            employee: {
                firstName: string;
                lastName: string;
            } | null;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fileUrl: string | null;
        employeeId: string;
        storedFileId: string | null;
        assignedByUserId: string;
        description: string | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.TaskPriority;
        dueDate: Date | null;
    })[] | ({
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
        submissions: {
            id: string;
            fileUrl: string | null;
            employeeId: string;
            storedFileId: string | null;
            status: import(".prisma/client").$Enums.SubmissionStatus;
            taskId: string;
            submittedAt: Date;
            reviewedByUserId: string | null;
            content: string;
            reviewComment: string | null;
        }[];
        dailyReports: {
            id: string;
            createdAt: Date;
            employeeId: string;
            description: string;
            taskId: string;
            progress: number;
            hoursSpent: number;
            submittedAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fileUrl: string | null;
        employeeId: string;
        storedFileId: string | null;
        assignedByUserId: string;
        description: string | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.TaskPriority;
        dueDate: Date | null;
    })[] | undefined>;
    updateStatus(id: string, updateTaskStatusDto: UpdateTaskStatusDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fileUrl: string | null;
        employeeId: string;
        storedFileId: string | null;
        assignedByUserId: string;
        description: string | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.TaskPriority;
        dueDate: Date | null;
    }>;
    submitTask(id: string, createSubmissionDto: CreateSubmissionDto, req: any, file: Express.Multer.File): Promise<{
        id: string;
        fileUrl: string | null;
        employeeId: string;
        storedFileId: string | null;
        status: import(".prisma/client").$Enums.SubmissionStatus;
        taskId: string;
        submittedAt: Date;
        reviewedByUserId: string | null;
        content: string;
        reviewComment: string | null;
    }>;
    createDailyReport(id: string, body: {
        progress: number;
        hoursSpent: number;
        description: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        employeeId: string;
        description: string;
        taskId: string;
        progress: number;
        hoursSpent: number;
        submittedAt: Date;
    }>;
    reviewTask(id: string, body: {
        status: string;
        reviewComment: string;
    }, req: any): Promise<{
        id: string;
        fileUrl: string | null;
        employeeId: string;
        storedFileId: string | null;
        status: import(".prisma/client").$Enums.SubmissionStatus;
        taskId: string;
        submittedAt: Date;
        reviewedByUserId: string | null;
        content: string;
        reviewComment: string | null;
    }>;
}
