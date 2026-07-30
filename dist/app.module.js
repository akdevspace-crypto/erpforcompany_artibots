"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const event_emitter_1 = require("@nestjs/event-emitter");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const employees_module_1 = require("./employees/employees.module");
const leaves_module_1 = require("./leaves/leaves.module");
const notifications_module_1 = require("./notifications/notifications.module");
const sos_module_1 = require("./sos/sos.module");
const attendance_module_1 = require("./attendance/attendance.module");
const leave_module_1 = require("./leave/leave.module");
const prisma_module_1 = require("./prisma/prisma.module");
const tokens_module_1 = require("./tokens/tokens.module");
const documents_module_1 = require("./documents/documents.module");
const departments_module_1 = require("./departments/departments.module");
const performance_module_1 = require("./performance/performance.module");
const tasks_module_1 = require("./tasks/tasks.module");
const tickets_module_1 = require("./tickets/tickets.module");
const announcements_module_1 = require("./announcements/announcements.module");
const profile_module_1 = require("./profile/profile.module");
const communication_module_1 = require("./communication/communication.module");
const teams_module_1 = require("./teams/teams.module");
const projects_module_1 = require("./projects/projects.module");
const transport_module_1 = require("./transport/transport.module");
const food_module_1 = require("./food/food.module");
const development_module_1 = require("./development/development.module");
const files_module_1 = require("./files/files.module");
const schedule_1 = require("@nestjs/schedule");
const scheduler_module_1 = require("./scheduler/scheduler.module");
const calendar_module_1 = require("./calendar/calendar.module");
const finance_module_1 = require("./finance/finance.module");
const mediasoup_module_1 = require("./mediasoup/mediasoup.module");
const meetings_module_1 = require("./meetings/meetings.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            event_emitter_1.EventEmitterModule.forRoot(),
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'uploads'),
                serveRoot: '/uploads',
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            employees_module_1.EmployeesModule,
            leaves_module_1.LeavesModule,
            notifications_module_1.NotificationsModule,
            sos_module_1.SosModule,
            attendance_module_1.AttendanceModule,
            leave_module_1.LeaveModule,
            tokens_module_1.TokensModule,
            documents_module_1.DocumentsModule,
            departments_module_1.DepartmentsModule,
            performance_module_1.PerformanceModule,
            tasks_module_1.TasksModule,
            tickets_module_1.TicketsModule,
            announcements_module_1.AnnouncementsModule,
            profile_module_1.ProfileModule,
            communication_module_1.CommunicationModule,
            teams_module_1.TeamsModule,
            projects_module_1.ProjectsModule,
            transport_module_1.TransportModule,
            food_module_1.FoodModule,
            development_module_1.DevelopmentModule,
            files_module_1.FilesModule,
            scheduler_module_1.SchedulerModule,
            calendar_module_1.CalendarModule,
            finance_module_1.FinanceModule,
            mediasoup_module_1.MediasoupModule,
            meetings_module_1.MeetingsModule
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map