import {Response} from 'express';
import {ClientError} from '../errors/clientError';

/*
 * Return responses to clients
 */
export class ResponseErrorWriter {

    /*
     * This blog's examples use a JSON response to provide client friendly OAuth errors
     * When required, such as to inform clients how to integrate, a www-authenticate header can be added here
     * - https://datatracker.ietf.org/doc/html/rfc6750#section-3
     */
    public writeErrorResponse(response: Response, clientError: ClientError): void {

        response.setHeader('content-type', 'application/json');
        response.status(clientError.getStatusCode()).send(JSON.stringify(clientError.toResponseFormat()));
    }
}
