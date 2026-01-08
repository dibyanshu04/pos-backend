export declare class SuccessResponseDto<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
    constructor(data: T, message?: string);
}
