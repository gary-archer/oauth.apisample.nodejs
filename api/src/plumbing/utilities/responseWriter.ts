import {Response} from 'express';
import { ClientError } from '../errors/clientError';

/*
 * Helper methods to write the response
 */
export class ResponseWriter {

    /*
     * Return data to the caller, which could be a success or error object
     */
    public static writeObjectResponse(response: Response, statusCode: number, data: any) {
        response.setHeader('Content-Type', 'application/json');
        response.status(statusCode).send(JSON.stringify(data));
    }

    /*
     * Return an invalid token response to the caller
     */
    public static writeInvalidTokenResponse(response: Response): void {
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('WWW-Authenticate', 'Bearer');

        const error = new ClientError(401, 'unauthorized', 'Missing, invalid or expired access token');
        response.status(error.statusCode).send(JSON.stringify(error.toResponseFormat()));
    }
}
