"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SosService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const sos_gateway_1 = require("./sos.gateway");
let SosService = SosService_1 = class SosService {
    prisma;
    sosGateway;
    logger = new common_1.Logger(SosService_1.name);
    constructor(prisma, sosGateway) {
        this.prisma = prisma;
        this.sosGateway = sosGateway;
    }
    async create(userId, createSosDto) {
        try {
            const employee = await this.prisma.employee.findUnique({
                where: { userId },
                include: { user: true },
            });
            if (!employee) {
                this.logger.error(`SOS Trigger Failed: No Employee profile found for User ID ${userId}`);
                throw new common_1.BadRequestException('Employee profile validation failed: You must have an employee profile to trigger SOS.');
            }
            const incident = await this.prisma.sosIncident.create({
                data: {
                    employeeId: employee.id,
                    source: createSosDto.source,
                    message: createSosDto.message,
                    initialLat: createSosDto.latitude,
                    initialLong: createSosDto.longitude,
                    lastLat: createSosDto.latitude,
                    lastLong: createSosDto.longitude,
                    status: 'ACTIVE',
                    locationLogs: createSosDto.latitude && createSosDto.longitude ? {
                        create: {
                            latitude: createSosDto.latitude,
                            longitude: createSosDto.longitude,
                        }
                    } : undefined,
                },
                include: {
                    employee: true,
                }
            });
            this.sosGateway.notifySosTriggered(incident);
            this.logger.log(`SOS Triggered by ${employee.firstName} ${employee.lastName}`);
            return incident;
        }
        catch (error) {
            this.logger.error('Error creating SOS incident', error.stack);
            throw error;
        }
    }
    async updateLocation(incidentId, updateLocationDto) {
        const incident = await this.prisma.sosIncident.update({
            where: { id: incidentId },
            data: {
                lastLat: updateLocationDto.latitude,
                lastLong: updateLocationDto.longitude,
                locationLogs: {
                    create: {
                        latitude: updateLocationDto.latitude,
                        longitude: updateLocationDto.longitude,
                    }
                }
            },
            include: { employee: true }
        });
        this.sosGateway.notifySosUpdate(incident);
        return incident;
    }
    async findAll() {
        return this.prisma.sosIncident.findMany({
            include: {
                employee: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                role: true,
                                department: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                },
                locationLogs: {
                    orderBy: { capturedAt: 'desc' },
                    take: 50
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateStatus(id, status, resolutionNotes) {
        const incident = await this.prisma.sosIncident.update({
            where: { id },
            data: {
                status,
                message: resolutionNotes ? resolutionNotes : undefined,
                resolvedAt: status === 'RESOLVED' || status === 'FALSE_ALARM' ? new Date() : undefined,
            },
            include: { employee: true }
        });
        this.sosGateway.notifySosUpdate(incident);
        return incident;
    }
};
exports.SosService = SosService;
exports.SosService = SosService = SosService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sos_gateway_1.SosGateway])
], SosService);
//# sourceMappingURL=sos.service.js.map