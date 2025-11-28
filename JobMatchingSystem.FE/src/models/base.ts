export interface BaseResponse<T> {
    statusCode: number;
    isSuccess: boolean;
    errorMessages: string[];
    result: T;
}

// Response cho các API có phân trang
export interface PaginatedResponse<T> {
    statusCode: number;
    isSuccess: boolean;
    errorMessages: string[];
    result: {
        items: T[];        // items luôn là array
        pageInfo: PageInfo;
    };
}

export interface PaginationParamsInput {
    page: number;
    size: number;
    search?: string;
    sortBy?: string;
    isDescending?: boolean; // Fixed spelling
    [key: string]: any;
}

export interface PageInfo {
    totalItem: number;
    totalPage: number;
    currentPage: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    sortBy: string;
    isDecending: boolean; // Keep consistent with backend
}





