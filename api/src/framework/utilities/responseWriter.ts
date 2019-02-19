import {Request, Response} from 'express';
import {ClientError} from '../errors/clientError';

/*
 * Helper methods to write the response
 */
export class ResponseWriter {

    /*
     * Return data to the caller, which could be a success or error object
     */
    public static writeObjectResponse(request: Request, response: Response, statusCode: number, data: any) {

        // Ensure the response is seen as JSON
        response.setHeader('Content-Type', 'application/json');

        // Write the standard header for 401 responses
        if (statusCode === 401) {
            response.setHeader('WWW-Authenticate', 'Bearer');
        }

        // Authentication middleware error responses do not have our CORS headers so write them here
        const CORS_HEADER = 'Access-Control-Allow-Origin';
        if (!response.getHeader(CORS_HEADER)) {
            const originHeader = request.header('Origin');
            if (originHeader) {
                response.setHeader(CORS_HEADER, originHeader);
            }
        }

        // Next write the response as an objecy
        response.status(statusCode).send(JSON.stringify(data));
    }
}
