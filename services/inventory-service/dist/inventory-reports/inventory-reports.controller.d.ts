import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { InventoryReportsService } from './inventory-reports.service';
export declare class InventoryReportsController {
    private readonly reportsService;
    constructor(reportsService: InventoryReportsService);
    currentStock(query: ReportQueryDto): Promise<SuccessResponseDto<any>>;
    consumption(query: ReportQueryDto): Promise<SuccessResponseDto<any>>;
    wastage(query: ReportQueryDto): Promise<SuccessResponseDto<any>>;
    variance(query: ReportQueryDto): Promise<SuccessResponseDto<any>>;
}
