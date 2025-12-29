export interface Order {
    id: number;
    amount: number;
    transferContent: string;
    status: OrderStatus;
    buyerId: number;
    serviceId: number;
    createdAt: string;
}

export type OrderStatus =
    | "Pending"
    | "Success"
    | "Failed";

export interface OrderFilterParams {
    page: number;
    size: number;
    search?: string;
    sortBy?: string;
    isDecending?: boolean; // Backend returns "isDecending", assuming param also matches
    status?: string; // Filter by status
}
