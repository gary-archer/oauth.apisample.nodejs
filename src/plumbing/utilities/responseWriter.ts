import {Response} from 'express';
import { ClientError } from '../errors/clientError';

/*
 * A helper object for writing standard responses
 */
export class ResponseWriter {

    /*
     * Return a failure HTTP response
     */
    public writeErrorResponse(response: Response, clientError: ClientError): void {

        // Indicate a JSON response
        response.setHeader('content-type', 'application/json');

        // Add the standards based header if required
        if (clientError.getStatusCode() === 401) {

            const realm = 'mycompany.com';
            let wwwAuthenticateHeader = `Bearer realm="${realm}"`;
            wwwAuthenticateHeader += `, error="${clientError.getErrorCode()}"`;
            wwwAuthenticateHeader += `, error_description="${clientError.message}"`;
            response.setHeader('www-authenticate', wwwAuthenticateHeader);
        }

        // Also add a more client friendly JSON response with the same fields
        response.status(clientError.getStatusCode()).send(JSON.stringify(clientError.toResponseFormat()));
    }
}
