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