import { SuccessResponseDto } from './common/dto/success-response.dto';
import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): SuccessResponseDto<string>;
}
