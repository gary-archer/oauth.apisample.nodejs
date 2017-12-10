import {Router, Request, Response} from 'express';
import * as cors from 'cors';
import GolfRepository from './golfRepository';
import ClaimsHandler from '../plumbing/claimsHandler';
import ErrorHandler from '../plumbing/errorHandler';
import ApiLogger from '../plumbing/apiLogger';

/*
 * A Web API class to manage routes
 */
export default class WebApi {
    
    /*
     * Fields
     */
    private _expressApp: Router;
    private _apiConfig: any;

    /*
     * Class setup
     */
    public constructor(expressApp: Router, apiConfig: any) {
        
        // Store fields
        this._expressApp = expressApp;
        this._apiConfig = apiConfig;

        // Configure cross origin requests
        let corsOptions = { origin: apiConfig.app.trusted_origins };
        this._expressApp.use('/api/*', cors(corsOptions));
        
        // Set up the API logger
        ApiLogger.initialize();
        this._setupCallbacks();
    }

    /*
     * Set up Web API routes
     */
    public configureRoutes(): void {
        
        // First handle claims processing
        this._expressApp.get('/api/*', this._claimsMiddleware);
        
        // Next process API operations
        this._expressApp.get('/api/golfers', this._getGolfers);
        this._expressApp.get('/api/golfers/:id([0-9]+)', this._getGolferDetails);
        
        // Unhandled exceptions
        this._expressApp.use('/api/*', this._unhandledExceptionMiddleware);
    }

    /*
     * The first middleware is for token validation, which occurs before business logic
     */
    private async _claimsMiddleware(request: Request, response: Response, next: any): Promise<void> {

        response.setHeader('Content-Type', 'application/json');
        ApiLogger.info('API call', 'Validating token'); 

        try {
            
            // Do the validation and get claims
            let handler = new ClaimsHandler(this._apiConfig.oauth);
            response.locals.claims = await handler.validateTokenAndGetClaims(request.header('authorization'));

            // Move onto business logic processing
            next();
        }
        catch(e) {

            // Ensure promises are rejected correctly
            this._writeResponseError(e, response);
        }
    }

    /*
     * Return the list of golfers
     */
    private async _getGolfers(request: Request, response: Response, next: any): Promise<void> {
        
        try {
            let repository = new GolfRepository();
            ApiLogger.info('API call', 'Request for golfer list');
            
            let golfers = await repository.getList();
            response.end(JSON.stringify(golfers));
        }
        catch(e) {
            
            // Ensure promises are rejected correctly
            this._writeResponseError(e, response);
        }
    }

    /*
     * Return the details for a golfer
     */
    private async _getGolferDetails(request: Request, response: Response, next: any): Promise<void> {
        
        try {
            let repository = new GolfRepository();
            let id = parseInt(request.params.id);
            ApiLogger.info('API call', `Request for golfer details for id: ${id}`);
            
            let golfer = await repository.getDetails(id);
            if (golfer) {
                response.end(JSON.stringify(golfer));
            }
            else {
                response.status(404).send(`The golfer with id ${id} was not found`);
            }
        }
        catch (e) {
            
            // Ensure promises are rejected correctly
            this._writeResponseError(e, response);
        }
    }

    /*
     * This does not catch promise based exceptions in async handling
     */
    private _unhandledExceptionMiddleware(unhandledException: any, request: Request, response: Response, next: any): void {

        this._writeResponseError(unhandledException, response);
    }

    /*
     * Return an error response to the client
     */
    private _writeResponseError(exception: any, response: Response): void {

        // Get error details
        let clientInfo = ErrorHandler.handleError(exception);
        
        // Set the standard header if required
        if (clientInfo.wwwAuthenticate) {
            response.setHeader('WWW-Authenticate', clientInfo.wwwAuthenticate);
        }
        
        // Send the response to the client
        response.status(clientInfo.status).send(JSON.stringify(clientInfo.error));
    }

    /*
     * Set up async callbacks
     */
    private _setupCallbacks(): void {
        this._claimsMiddleware = this._claimsMiddleware.bind(this);
        this._getGolferDetails = this._getGolferDetails.bind(this);
        this._unhandledExceptionMiddleware = this._unhandledExceptionMiddleware.bind(this);
        this._writeResponseError = this._writeResponseError.bind(this);
    }
}