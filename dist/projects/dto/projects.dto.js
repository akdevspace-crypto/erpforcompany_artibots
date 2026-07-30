"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminationRequestDto = exports.CreateReportDto = exports.SelectDepartmentsDto = exports.AssignProjectManagerDto = exports.AssignSeniorManagerDto = exports.CreateProjectDto = void 0;
class CreateProjectDto {
    title;
    description;
    deadline;
    seniorManagerId;
}
exports.CreateProjectDto = CreateProjectDto;
class AssignSeniorManagerDto {
    seniorManagerId;
}
exports.AssignSeniorManagerDto = AssignSeniorManagerDto;
class AssignProjectManagerDto {
    projectManagerId;
}
exports.AssignProjectManagerDto = AssignProjectManagerDto;
class SelectDepartmentsDto {
    departmentIds;
}
exports.SelectDepartmentsDto = SelectDepartmentsDto;
class CreateReportDto {
    title;
    content;
    fileUrl;
}
exports.CreateReportDto = CreateReportDto;
class TerminationRequestDto {
    reason;
    descriptionReport;
    proofUrl;
    discussionReport;
    isOnline;
}
exports.TerminationRequestDto = TerminationRequestDto;
//# sourceMappingURL=projects.dto.js.map