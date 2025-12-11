  export class ErrorResponseDto {
  success: boolean;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;

  constructor(message: string, error: string, statusCode: number) {
    this.success = false;
    this.message = message;
    this.error = error;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}
