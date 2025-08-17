import {PerformanceBreakdown} from './performanceBreakdown.js';

/*
 * A log entry collects data during an API request and outputs it at the end
 */
export interface LogEntry {

    // Create a performance breakdown for business logic
    createPerformanceBreakdown(name: string): PerformanceBreakdown;

    // Add text logging from business logic (not recommended)
    addInfo(info: any): void;
}
