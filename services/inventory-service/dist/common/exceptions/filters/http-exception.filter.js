"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenException = exports.UnauthorizedException = exports.NotFoundException = exports.ValidationException = void 0;
const common_1 = require("@nestjs/common");
class ValidationException extends common_1.HttpException {
    constructor(errors) {
        super({
            message: 'Validation failed',
            errors,
            error: 'Bad Request',
            statusCode: common_1.HttpStatus.BAD_REQUEST,
        }, common_1.HttpStatus.BAD_REQUEST);
    }
}
exports.ValidationException = ValidationException;
class NotFoundException extends common_1.HttpException {
    constructor(resource) {
        super({
            message: `${resource} not found`,
            error: 'Not Found',
            statusCode: common_1.HttpStatus.NOT_FOUND,
        }, common_1.HttpStatus.NOT_FOUND);
    }
}
exports.NotFoundException = NotFoundException;
class UnauthorizedException extends common_1.HttpException {
    constructor(message = 'Unauthorized') {
        super({
            message,
            error: 'Unauthorized',
            statusCode: common_1.HttpStatus.UNAUTHORIZED,
        }, common_1.HttpStatus.UNAUTHORIZED);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends common_1.HttpException {
    constructor(message = 'Forbidden') {
        super({
            message,
            error: 'Forbidden',
            statusCode: common_1.HttpStatus.FORBIDDEN,
        }, common_1.HttpStatus.FORBIDDEN);
    }
}
exports.ForbiddenException = ForbiddenException;
//# sourceMappingURL=http-exception.filter.js.map