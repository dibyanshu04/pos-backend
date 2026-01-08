import { HttpException } from '@nestjs/common';
export declare class ValidationException extends HttpException {
    constructor(errors: any[]);
}
export declare class NotFoundException extends HttpException {
    constructor(resource: string);
}
export declare class UnauthorizedException extends HttpException {
    constructor(message?: string);
}
export declare class ForbiddenException extends HttpException {
    constructor(message?: string);
}
