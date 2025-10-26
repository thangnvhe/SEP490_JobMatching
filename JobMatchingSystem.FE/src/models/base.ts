export interface BaseResponse<T> {
    statusCode: number;
    isSuccess: boolean;
    errorMessages: string[];
    result: T;
}
