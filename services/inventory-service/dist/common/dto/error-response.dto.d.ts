export declare class ErrorResponseDto {
    success: boolean;
    message: string;
    error: string;
    statusCode: number;
    timestamp: string;
    constructor(message: string, error: string, statusCode: number);
}
