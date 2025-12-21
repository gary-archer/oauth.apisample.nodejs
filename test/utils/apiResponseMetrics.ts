/*
 * Some metrics once an API call completes
 */
export interface ApiResponseMetrics {
    operation: string;
    sessionId: string;
    startTime: Date;
    correlationId: string;
    millisecondsTaken: number;
}
