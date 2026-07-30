import { FoodService } from './food.service';
export declare class FoodController {
    private readonly foodService;
    constructor(foodService: FoodService);
    getMyBalance(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        year: number;
        month: number;
        totalTokens: number;
        usedTokens: number;
    }>;
    getMyTransactions(req: any): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.FoodTransactionType;
        employeeId: string;
        description: string | null;
        tokensUsed: number;
        amountCharged: number;
    }[]>;
    consume(req: any, body: {
        tokens: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.FoodTransactionType;
        employeeId: string;
        description: string | null;
        tokensUsed: number;
        amountCharged: number;
    }>;
    getAdminStats(req: any): Promise<{
        totalMealsToday: number;
        totalMenuItems: number;
        pendingOrders: number;
        deliveredOrders: number;
    }>;
    getTodayOrders(req: any): Promise<({
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
    updateOrderStatus(req: any, orderId: string, body: {
        status: string;
    }): Promise<{
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
    getMenuItems(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        description: string | null;
        price: number;
        isAvailable: boolean;
    }[]>;
    createMenuItem(req: any, body: {
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
    updateMenuItem(req: any, itemId: string, body: {
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
    deleteMenuItem(req: any, itemId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        description: string | null;
        price: number;
        isAvailable: boolean;
    }>;
    getFoodReports(req: any): Promise<{
        totalOrders: number;
        totalRevenue: number;
        ordersByStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.FoodOrderGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        popularItems: unknown[];
    }>;
}
