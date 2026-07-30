export declare class CreateProjectDto {
    title: string;
    description?: string;
    deadline?: Date;
    seniorManagerId?: string;
}
export declare class AssignSeniorManagerDto {
    seniorManagerId: string;
}
export declare class AssignProjectManagerDto {
    projectManagerId: string;
}
export declare class SelectDepartmentsDto {
    departmentIds: string[];
}
export declare class CreateReportDto {
    title: string;
    content: string;
    fileUrl: string;
}
export declare class TerminationRequestDto {
    reason?: string;
    descriptionReport?: string;
    proofUrl?: string;
    discussionReport?: string;
    isOnline?: boolean;
}
