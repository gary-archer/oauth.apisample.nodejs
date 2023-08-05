import color from '@colors/colors';
import {Guid} from 'guid-typescript';
import {ExtraCaCerts} from '../src/plumbing/utilities/extraCaCerts.js';
import {ApiClient} from './utils/apiClient.js';
import {ApiRequestOptions} from './utils/apiRequestOptions.js';
import {ApiResponse} from './utils/apiResponse.js';
import {TokenIssuer} from './utils/tokenIssuer.js';
import {WiremockAdmin} from './utils/wiremockAdmin.js';

/*
 * A basic load test to run some requests in parallel and report results
 */
export class LoadTest {

    private readonly _tokenIssuer: TokenIssuer;
    private readonly _wiremockAdmin: WiremockAdmin;
    private readonly _apiClient: ApiClient;
    private readonly _sessionId: string;
    private readonly _guestUserId: string;
    private _totalCount: number;
    private _errorCount: number;

    public constructor() {

        this._tokenIssuer = new TokenIssuer();
        this._wiremockAdmin = new WiremockAdmin(false);

        const apiBaseUrl = 'https://apilocal.authsamples-dev.com:446';
        this._sessionId = Guid.create().toString();
        this._apiClient = new ApiClient(apiBaseUrl, 'LoadTest', this._sessionId, false);

        this._guestUserId  = 'a6b404b1-98af-41a2-8e7f-e4061dc0bf86';
        this._totalCount = 0;
        this._errorCount = 0;
    }

    /*
     * Call the API with a volume of requests, with batches that run in parallel
     * The tests can be used to verify that Elasticsearch logging is working as requested
     */
    public async execute(): Promise<void> {

        // First prepare the system
        ExtraCaCerts.initialize();
        await this._oauthSetup();

        // Get some access tokens to send to the API
        const startMessage = `Load test session ${this._sessionId} starting at ${new Date().toISOString()}\n`;
        console.log(color.blue(startMessage));
        const accessTokens = await this._getAccessTokens();

        // Show a startup table header
        const startTime = process.hrtime();
        const headings = [
            'OPERATION'.padEnd(25),
            'CORRELATION-ID'.padEnd(38),
            'START-TIME'.padEnd(28),
            'MILLISECONDS-TAKEN'.padEnd(21),
            'STATUS-CODE'.padEnd(14),
            'ERROR-CODE'.padEnd(24),
            'ERROR-ID'.padEnd(12),
        ];
        const header = headings.join('');
        console.log(color.yellow(header));

        // Next execute the main body of requests
        await this._sendLoadTestRequests(accessTokens);

        // Report a summary of results
        const endTime = process.hrtime(startTime);
        const millisecondsTaken = Math.floor((endTime[0] * 1000000000 + endTime[1]) / 1000000);
        const endMessage = `Load test session ${this._sessionId} completed in ${millisecondsTaken} milliseconds`;
        const errorStats = `${this._errorCount} errors from ${this._totalCount} requests`;
        console.log(color.blue(`\n${endMessage}: (${errorStats})`));

        // Clean up before exiting
        await this._oauthTeardown();
    }

    /*
     * Prepare the mock Authorization Server
     */
    private async _oauthSetup(): Promise<void> {

        // Generate some JSON Web Keys for signing JWTs
        await this._tokenIssuer.initialize();
        const keyset = await this._tokenIssuer.getTokenSigningPublicKeys();

        // Register them with Wiremock so that the API uses them to validate access tokens
        await this._wiremockAdmin.registerJsonWebWeys(keyset);
    }

    /*
     * Clean up the mock Authorization Server
     */
    private async _oauthTeardown(): Promise<void> {
        await this._wiremockAdmin.unregisterJsonWebWeys();
    }

    /*
     * Do some initial work to get multiple access tokens
     */
    private async _getAccessTokens(): Promise<string[]> {

        const accessTokens: string[] = [];
        for (let index = 0; index < 5; index++) {
            const accessToken = await this._tokenIssuer.issueAccessToken(this._guestUserId);
            accessTokens.push(accessToken);
        }

        // Return access tokens for later API requests, which will run faster
        return accessTokens;
    }

    /*
     * Run the main body of API requests, including some invalid requests that trigger errors
     */
    private async _sendLoadTestRequests(accessTokens: string[]): Promise<void> {

        // Next produce some requests that will run in parallel
        const requests: (() => Promise<ApiResponse>)[] = [];
        for (let index = 0; index < 100; index++) {

            // Create a 401 error on request 10, by making the access token act expired
            let accessToken = accessTokens[index % 5];
            if (index === 10) {
                accessToken += 'x';
            }

            // Create some promises for various API endpoints
            if (index % 5 === 0) {

                requests.push(this._createUserInfoRequest(accessToken));

            } else if (index % 5 === 1) {

                requests.push(this._createTransactionsRequest(accessToken, 2));

            } else if (index % 5 === 2) {

                // On request 71 try to access unauthorized data for company 3, to create a 404 error
                const companyId = (index === 72) ? 3 : 2;
                requests.push(this._createTransactionsRequest(accessToken, companyId));

            } else {

                requests.push(this._createCompaniesRequest(accessToken));
            }
        }

        // Fire the API requests in batches
        await this._executeApiRequests(requests);
    }

    /*
     * Create a user info request callback
     */
    private _createUserInfoRequest(accessToken: string): () => Promise<ApiResponse> {

        const options = new ApiRequestOptions(accessToken);
        this._initializeApiRequest(options);

        return () => this._apiClient.getUserInfoClaims(options);
    }

    /*
     * Create a get companies request callback
     */
    private _createCompaniesRequest(accessToken: string): () => Promise<ApiResponse> {

        const options = new ApiRequestOptions(accessToken);
        this._initializeApiRequest(options);

        return () => this._apiClient.getCompanyList(options);
    }

    /*
     * Create a get transactions request callback
     */
    private _createTransactionsRequest(accessToken: string, companyId: number): () => Promise<ApiResponse> {

        const options = new ApiRequestOptions(accessToken);
        this._initializeApiRequest(options);

        return () => this._apiClient.getCompanyTransactions(options, companyId);
    }

    /*
     * Set any special logic before sending an API request
     */
    private _initializeApiRequest(options: ApiRequestOptions): void {

        // On request 85 we'll simulate a 500 error via a custom header
        this._totalCount++;
        if (this._totalCount === 85) {
            options.rehearseException = true;
        }
    }

    /*
     * Issue API requests in batches of 5, to avoid excessive queueing on a development computer
     * By default there is a limit of 5 concurrent outgoing requests to a single host
     */
    private async _executeApiRequests(requests: (() => Promise<ApiResponse>)[]): Promise<void> {

        // Set counters
        const total = requests.length;
        const batchSize = 5;
        let current = 0;

        // Process one batch at a time
        while (current < total) {

            // Get a batch of requests
            const requestBatch = requests.slice(current, Math.min(current + batchSize, total));

            // Execute them to create promises
            const batchPromises = requestBatch.map((r) => this._executeApiRequest(r));

            // Wait for the batch to complete
            await Promise.all(batchPromises);
            current += batchSize;
        }
    }

    /*
     * Start execution and return a success promise regardless of whether the API call succeeded
     */
    private _executeApiRequest(callback: () => Promise<ApiResponse>): Promise<ApiResponse> {

        return new Promise<ApiResponse>((resolve) => {

            // Call 'then' to start firing the API request without waiting
            callback().then((response) => {

                if (response.statusCode >= 200 && response.statusCode <= 299) {

                    // Report successful requests
                    console.log(color.green(this._formatMetrics(response)));

                } else {

                    // Report failed requests, some of which are expected
                    console.log(color.red(this._formatMetrics(response)));
                    this._errorCount++;
                }

                // Resolve the promise
                resolve(response);
            });
        });
    }

    /*
     * Get metrics as a table row
     */
    private _formatMetrics(response: ApiResponse): string {

        let errorCode = '';
        let errorId   = '';

        if (response.statusCode >= 400 && response.body.code) {
            errorCode = response.body.code;
        }

        if (response.statusCode >= 500 && response.body.id) {
            errorId = response.body.id.toString();
        }

        const values = [
            response.metrics.operation.padEnd(25),
            response.metrics.correlationId.padEnd(38),
            response.metrics.startTime.toISOString().padEnd(28),
            response.metrics.millisecondsTaken.toString().padEnd(21),
            response.statusCode.toString().padEnd(14),
            errorCode.padEnd(24),
            errorId.padEnd(12),
        ];
        return values.join('');
    }
}

/*
 * Run the load test
 */
(async () => {
    const loadTest = new LoadTest();
    await loadTest.execute();
})();
