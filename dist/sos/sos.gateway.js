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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SosGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let SosGateway = class SosGateway {
    server;
    logger = new common_1.Logger('SosGateway');
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        const userId = client.handshake.query.userId;
        const role = client.handshake.query.role;
        const deptId = client.handshake.query.departmentId;
        if (role === 'SUPER_ADMIN') {
            client.join('role:SUPER_ADMIN');
        }
        if (deptId) {
            client.join(`dept:${deptId}`);
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    notifySosTriggered(incident) {
        if (this.server) {
            this.server.to('role:SUPER_ADMIN').emit('sos:triggered', incident);
        }
        else {
            console.warn('WebSocket Server not ready, skipping SOS notification');
        }
    }
    notifySosUpdate(incident) {
        if (this.server) {
            this.server.to('role:SUPER_ADMIN').emit('sos:update', incident);
        }
    }
};
exports.SosGateway = SosGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SosGateway.prototype, "server", void 0);
exports.SosGateway = SosGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: 'sos',
    })
], SosGateway);
//# sourceMappingURL=sos.gateway.js.map