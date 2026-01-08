"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const success_response_dto_1 = require("../dto/success-response.dto");
let SuccessResponseInterceptor = class SuccessResponseInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((data) => {
            if (data && typeof data === 'object' && 'success' in data) {
                return data;
            }
            const ctx = context.switchToHttp();
            const response = ctx.getResponse();
            const statusCode = response.statusCode || 200;
            let message = 'Success';
            const request = ctx.getRequest();
            switch (request.method) {
                case 'POST':
                    message = 'Resource created successfully';
                    break;
                case 'PUT':
                case 'PATCH':
                    message = 'Resource updated successfully';
                    break;
                case 'DELETE':
                    message = 'Resource deleted successfully';
                    break;
            }
            return new success_response_dto_1.SuccessResponseDto(data, message);
        }));
    }
};
exports.SuccessResponseInterceptor = SuccessResponseInterceptor;
exports.SuccessResponseInterceptor = SuccessResponseInterceptor = __decorate([
    (0, common_1.Injectable)()
], SuccessResponseInterceptor);
//# sourceMappingURL=success-response.interceptor.js.map