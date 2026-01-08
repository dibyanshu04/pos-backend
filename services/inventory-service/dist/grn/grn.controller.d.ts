import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { CreateGrnDto } from './dto/create-grn.dto';
import { GrnService } from './grn.service';
export declare class GrnController {
    private readonly grnService;
    constructor(grnService: GrnService);
    create(dto: CreateGrnDto, req: any): Promise<SuccessResponseDto<any>>;
    findAll(outletId: string): Promise<SuccessResponseDto<any[]>>;
    findOne(id: string): Promise<SuccessResponseDto<any>>;
}
