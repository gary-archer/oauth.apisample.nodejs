import {Request, Response} from 'express';

/*
 * Metadata for a route to enable logging
 */
export interface RouteMetadata {
    controller: symbol,
    action: (c: any) => (request: Request, response: Response) => Promise<void>,
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    path: string,
}
