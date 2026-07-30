import { PrismaService } from '../prisma/prisma.service';
export declare class FoodService {
    private prisma;
    constructor(prisma: PrismaService);
    getMyBalance(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        year: number;
        month: number;
        totalTokens: number;
        usedTokens: number;
    }>;
    getMyTransactions(userId: string): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.FoodTransactionType;
        employeeId: string;
        description: string | null;
        tokensUsed: number;
        amountCharged: number;
    }[]>;
    consumeTokens(userId: string, tokensRequested: number): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.FoodTransactionType;
        employeeId: string;
        description: string | null;
        tokensUsed: number;
        amountCharged: number;
    }>;
    getAdminStats(): Promise<{
        totalMealsToday: number;
        totalMenuItems: number;
        pendingOrders: number;
        deliveredOrders: number;
    }>;
    getTodayOrders(): Promise<({
        employee: {
            user: {
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
        items: ({
            foodItem: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                category: string;
                description: string | null;
                price: number;
                isAvailable: boolean;
            };
        } & {
            id: string;
            price: number;
            orderId: string;
            foodItemId: string;
            quantity: number;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        status: import(".prisma/client").$Enums.FoodOrderStatus;
        paymentStatus: string;
        totalAmount: number;
        floor: string | null;
        seatNumber: string | null;
    })[]>;
    updateOrderStatus(orderId: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        status: import(".prisma/client").$Enums.FoodOrderStatus;
        paymentStatus: string;
        totalAmount: number;
        floor: string | null;
        seatNumber: string | null;
    }>;
    getAllMenuItems(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        description: string | null;
        price: number;
        isAvailable: boolean;
    }[]>;
    createMenuItem(data: {
        name: string;
        description?: string;
        price: number;
        category?: string;
        isAvailable?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        description: string | null;
        price: number;
        isAvailable: boolean;
    }>;
    updateMenuItem(itemId: string, data: {
        name?: string;
        description?: string;
        price?: number;
        category?: string;
        isAvailable?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        description: string | null;
        price: number;
        isAvailable: boolean;
    }>;
    deleteMenuItem(itemId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        description: string | null;
        price: number;
        isAvailable: boolean;
    }>;
    getFoodReports(): Promise<{
        totalOrders: number;
        totalRevenue: number;
        ordersByStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.FoodOrderGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        popularItems: unknown[];
    }>;
}
