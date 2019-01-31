import {NextFunction, Request, Response} from 'express';
import {Configuration} from '../configuration/configuration';
import {ErrorHandler} from '../plumbing/errors/errorHandler';
import {Authenticator} from '../plumbing/oauth/authenticator';
import {ClaimsCache} from '../plumbing/oauth/claimsCache';
import {ClaimsMiddleware} from '../plumbing/oauth/claimsMiddleware';
import {IssuerMetadata} from '../plumbing/oauth/issuerMetadata';
import {JsonFileReader} from '../plumbing/utilities/jsonFileReader';
import {ResponseWriter} from '../plumbing/utilities/responseWriter';
import {AuthorizationRulesRepository} from './authorizationRulesRepository';
import {CompanyController} from './companyController';
import {CompanyRepository} from './companyRepository';

/*
 * An entry point to handle API requests using Express request and response objects
 */
export class WebApi {

    /*
     * Dependencies
     */
    private _apiConfig: Configuration;
    private _claimsCache: ClaimsCache;
    private _issuerMetadata: IssuerMetadata;

    /*
     * API construction and startup
     */
    public constructor(apiConfig: Configuration) {

        this._apiConfig = apiConfig;

        // Create the singleton claims cache
        this._claimsCache = new ClaimsCache();

        // Load metadata
        this._issuerMetadata = new IssuerMetadata(this._apiConfig.oauth);
        this._issuerMetadata.load();

        this._setupCallbacks();
    }

    /*
     * The entry point for authorization and claims handling
     */
    public async authorizationHandler(
        request: Request,
        response: Response,
        next: NextFunction): Promise<void> {

        try {

            // Create the claims middleware instance and non singleton dependencies on every API request
            const authenticator = new Authenticator(this._apiConfig.oauth, this._issuerMetadata);
            const authorizationRulesRepository = new AuthorizationRulesRepository();
            const middleware = new ClaimsMiddleware(this._claimsCache, authenticator, authorizationRulesRepository);

            // Try to get the access token
            const accessToken = this._readAccessToken(request);

            // Do the token and claims work
            const claims = await middleware.authorizeRequestAndSetClaims(request, response, next);
            if (!claims) {

                // Return 401 responses if the token is missing, expired or invalid
                ResponseWriter.writeInvalidTokenResponse(response);
            } else {

                // On success, set claims against the request context and move on to the controller logic
                response.locals.claims = cachedClaims;
                next();
            }

        } catch (e) {

            // Return a 500 error if something went wrong, and prevent redirect loops for the SPA
            this.unhandledExceptionHandler(e, request, response);
        }
    }

    /*
     * Return the user info claims from authorization
     */
    public async getUserClaims(
        request: Request,
        response: Response,
        next: NextFunction): Promise<void> {

        return response.locals.claims.userInfo;
    }

    /*
     * Return a list of companies
     */
    public async getCompanyList(
        request: Request,
        response: Response,
        next: NextFunction): Promise<void> {

        try {
            // Create the controller instance and its dependencies on every API request
            const reader = new JsonFileReader();
            const repository = new CompanyRepository(response.locals.claims, reader);
            const controller = new CompanyController(repository);

            // Get the data and return it in the response
            const result = await controller.getCompanyList();
            ResponseWriter.writeObjectResponse(response, 200, result);

        } catch (e) {
            this.unhandledExceptionHandler(e, request, response);
        }
    }

    /*
     * Return company transactions
     */
    public async getCompanyTransactions(
        request: Request,
        response: Response,
        next: NextFunction): Promise<void> {

        try {
            // Create the controller instance and its dependencies on every API request
            const reader = new JsonFileReader();
            const repository = new CompanyRepository(response.locals.claims, reader);
            const controller = new CompanyController(repository);

            // Get the data and return it in the response
            const id = parseInt(request.params.id, 10);
            const result = await controller.getCompanyTransactions(id);
            ResponseWriter.writeObjectResponse(response, 200, result);

        } catch (e) {
            this.unhandledExceptionHandler(e, request, response);
        }
    }

    /*
     * The entry point for handling exceptions forwards all exceptions to our handler class
     */
    public unhandledExceptionHandler(
        unhandledException: any,
        request: Request,
        response: Response): void {

        const clientError = ErrorHandler.handleError(unhandledException);
        ResponseWriter.writeObjectResponse(response, clientError.statusCode, clientError.toResponseFormat());
    }

    /*
     * Try to read the token from the authorization header
     */
    private _readAccessToken(request: Request): string | null {

        const authorizationHeader = request.header('authorization');
        if (authorizationHeader) {
            const parts = authorizationHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                return parts[1];
            }
        }

        return null;
    }

    /*
     * Set up async callbacks
     */
    private _setupCallbacks(): void {
        this.authorizationHandler = this.authorizationHandler.bind(this);
        this.getUserClaims = this.getUserClaims.bind(this);
        this.getCompanyList = this.getCompanyList.bind(this);
        this.getCompanyTransactions = this.getCompanyTransactions.bind(this);
        this.unhandledExceptionHandler = this.unhandledExceptionHandler.bind(this);
    }
}
