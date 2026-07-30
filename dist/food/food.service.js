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
exports.FoodService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let FoodService = class FoodService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyBalance(userId) {
        const employee = await this.prisma.employee.findUnique({ where: { userId } });
        if (!employee)
            throw new common_1.NotFoundException('Employee profile not found');
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        let balance = await this.prisma.foodTokenBalance.findUnique({
            where: {
                employeeId_year_month: {
                    employeeId: employee.id,
                    year,
                    month
                }
            }
        });
        if (!balance) {
            balance = await this.prisma.foodTokenBalance.create({
                data: {
                    employeeId: employee.id,
                    year,
                    month,
                    totalTokens: 20,
                    usedTokens: 0
                }
            });
        }
        return balance;
    }
    async getMyTransactions(userId) {
        const employee = await this.prisma.employee.findUnique({ where: { userId } });
        if (!employee)
            throw new common_1.NotFoundException('Employee profile not found');
        return this.prisma.foodTransaction.findMany({
            where: { employeeId: employee.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }
    async consumeTokens(userId, tokensRequested) {
        const employee = await this.prisma.employee.findUnique({ where: { userId } });
        if (!employee)
            throw new common_1.NotFoundException('Employee profile not found');
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        let balance = await this.prisma.foodTokenBalance.findUnique({
            where: { employeeId_year_month: { employeeId: employee.id, year, month } }
        });
        if (!balance) {
            balance = await this.prisma.foodTokenBalance.create({
                data: { employeeId: employee.id, year, month, totalTokens: 20, usedTokens: 0 }
            });
        }
        const remaining = balance.totalTokens - balance.usedTokens;
        let transactionType = 'TOKEN';
        let amountCharged = 0;
        if (remaining >= tokensRequested) {
            await this.prisma.foodTokenBalance.update({
                where: { id: balance.id },
                data: { usedTokens: { increment: tokensRequested } }
            });
        }
        else {
            transactionType = 'USE_EXTRA';
            amountCharged = 50 * tokensRequested;
            if (remaining > 0) {
                const tokensToDeduct = remaining;
                const extra = tokensRequested - remaining;
                amountCharged = extra * 50;
                await this.prisma.foodTokenBalance.update({
                    where: { id: balance.id },
                    data: { usedTokens: { increment: tokensToDeduct } }
                });
            }
            else {
                amountCharged = tokensRequested * 50;
            }
        }
        return this.prisma.foodTransaction.create({
            data: {
                employeeId: employee.id,
                tokensUsed: transactionType === 'TOKEN' ? tokensRequested : (remaining > 0 ? remaining : 0),
                type: transactionType,
                amountCharged: amountCharged,
                description: `Consumed ${tokensRequested} meal(s)`
            }
        });
    }
    async getAdminStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const totalMealsToday = await this.prisma.foodOrder.count({
            where: {
                createdAt: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });
        const totalMenuItems = await this.prisma.foodItem.count();
        const pendingOrders = await this.prisma.foodOrder.count({
            where: { status: 'PENDING' }
        });
        const deliveredOrders = await this.prisma.foodOrder.count({
            where: { status: 'DELIVERED' }
        });
        return {
            totalMealsToday,
            totalMenuItems,
            pendingOrders,
            deliveredOrders
        };
    }
    async getTodayOrders() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const orders = await this.prisma.foodOrder.findMany({
            where: {
                createdAt: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            },
            include: {
                employee: {
                    include: {
                        user: true
                    }
                },
                items: {
                    include: {
                        foodItem: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return orders;
    }
    async updateOrderStatus(orderId, status) {
        const validStatuses = Object.values(client_1.FoodOrderStatus);
        if (!validStatuses.includes(status)) {
            throw new common_1.BadRequestException('Invalid order status');
        }
        return this.prisma.foodOrder.update({
            where: { id: orderId },
            data: { status: status }
        });
    }
    async getAllMenuItems() {
        return this.prisma.foodItem.findMany({
            orderBy: {
                name: 'asc'
            }
        });
    }
    async createMenuItem(data) {
        return this.prisma.foodItem.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                category: data.category || 'MEAL',
                isAvailable: data.isAvailable ?? true
            }
        });
    }
    async updateMenuItem(itemId, data) {
        return this.prisma.foodItem.update({
            where: { id: itemId },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.price && { price: data.price }),
                ...(data.category && { category: data.category }),
                ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable })
            }
        });
    }
    async deleteMenuItem(itemId) {
        return this.prisma.foodItem.delete({
            where: { id: itemId }
        });
    }
    async getFoodReports() {
        const totalOrders = await this.prisma.foodOrder.count();
        const totalRevenue = await this.prisma.foodOrder.aggregate({
            _sum: {
                totalAmount: true
            }
        });
        const ordersByStatus = await this.prisma.foodOrder.groupBy({
            by: ['status'],
            _count: true
        });
        const allOrderItems = await this.prisma.foodOrderItem.findMany({
            include: {
                foodItem: true
            }
        });
        const itemQuantities = allOrderItems.reduce((acc, item) => {
            const key = item.foodItemId;
            if (!acc[key]) {
                acc[key] = {
                    foodItem: item.foodItem,
                    totalQuantity: 0
                };
            }
            acc[key].totalQuantity += item.quantity;
            return acc;
        }, {});
        const popularItems = Object.values(itemQuantities)
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, 5);
        return {
            totalOrders,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            ordersByStatus,
            popularItems
        };
    }
};
exports.FoodService = FoodService;
exports.FoodService = FoodService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FoodService);
//# sourceMappingURL=food.service.js.map