import {Request, Response} from 'express';
import {ServiceIdentifier} from 'inversify';

/*
 * Metadata for a route to enable logging
 */
export interface RouteMetadata {
    controller: ServiceIdentifier,
    action: (c: any) => (request: Request, response: Response) => Promise<void>,
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    path: string,
}
