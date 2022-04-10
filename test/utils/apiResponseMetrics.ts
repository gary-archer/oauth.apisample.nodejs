/*
 * Some metrics once an API call completes
 */
export interface ApiResponseMetrics {
    operation: string;
    startTime: Date;
    millisecondsTaken: number;
    statusCode: number;
    errorCode: string;
    errorId: string;
}
