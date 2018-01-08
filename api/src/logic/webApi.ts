import {Router, Request, Response} from 'express';
import * as cors from 'cors';
import IcoRepository from './icoRepository';
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
        this._expressApp.get('/api/icos', this._getIcoList);
        this._expressApp.get('/api/icos/:contract_address', this._getIcoTransactions);
        
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
     * Return the list of ICOs
     */
    private async _getIcoList(request: Request, response: Response, next: any): Promise<void> {
        
        try {
            let repository = new IcoRepository();
            ApiLogger.info('API call', 'Request for ICO list');
            
            let icos = await repository.getList();
            response.end(JSON.stringify(icos));
        }
        catch(e) {
            
            // Ensure promises are rejected correctly
            this._writeResponseError(e, response);
        }
    }

    /*
     * Return the transaction details for an ICO
     */
    private async _getIcoTransactions(request: Request, response: Response, next: any): Promise<void> {
        
        try {
            ApiLogger.info('API call', `Request for ICO with contract address: ${request.params.contract_address}`);
            
            let repository = new IcoRepository();
            let ico = await repository.getTransactions(request.params.contract_address);
            if (ico) {
                response.end(JSON.stringify(ico));
            }
            else {
                response.status(404).send(`The ICO with contract address ${request.params.contract_address} was not found`);
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
        this._getIcoTransactions = this._getIcoTransactions.bind(this);
        this._unhandledExceptionMiddleware = this._unhandledExceptionMiddleware.bind(this);
        this._writeResponseError = this._writeResponseError.bind(this);
    }
}