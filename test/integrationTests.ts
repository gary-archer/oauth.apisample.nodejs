import assert from 'assert';
import {Guid} from 'guid-typescript';
import {ApiClient} from './utils/apiClient';
import {ApiRequestOptions} from './utils/apiRequestOptions';
import {TokenIssuer} from './utils/tokenIssuer';
import {WiremockAdmin} from './utils/wiremockAdmin';

/*
 * Test the API in isolation, without any dependencies on the Authorization Server
 */
describe('OAuth API Tests', () => {

    // The real subject claim values for my two online test users
    const guestUserId  = 'a6b404b1-98af-41a2-8e7f-e4061dc0bf86';
    const guestAdminId = '77a97e5b-b748-45e5-bb6f-658e85b2df91';

    // A class to issue our own JWTs for testing
    const tokenIssuer = new TokenIssuer();
    const wiremockAdmin = new WiremockAdmin(false);

    // Create the API client
    const apiBaseUrl = 'https://api.authsamples-dev.com:445';
    const sessionId = Guid.create().toString();
    const apiClient = new ApiClient(apiBaseUrl, 'IntegrationTests', sessionId, false);

    /*
     * Initialize the test configuration and token issuer, then register a mock keyset the API will use to validate JWTs
     */
    before( async () => {
        await tokenIssuer.initialize();
        const keyset = await tokenIssuer.getTokenSigningPublicKeys();
        await wiremockAdmin.registerJsonWebWeys(keyset);
    });

    /*
     * Restore the API's main configuration and clean up wiremock resources
     */
    after( async () => {
        await wiremockAdmin.unregisterJsonWebWeys();
        await wiremockAdmin.unregisterUserInfo();
    });

    /*
     * Test getting claims
     */
    it ('Get user claims returns a single region for the standard user', async () => {

        // Get an access token for the end user of this test
        const accessToken = await tokenIssuer.issueAccessToken(guestUserId);

        // The API will call the Authorization Server to get user info for the token, so register a mock response
        const mockUserInfo = {
            given_name: 'Guest',
            family_name: 'User',
            email: 'guestuser@mycompany.com',
        };
        await wiremockAdmin.registerUserInfo(JSON.stringify(mockUserInfo));

        // Call the API
        const options = new ApiRequestOptions(accessToken);
        const response = await apiClient.getUserInfoClaims(options);

        // Assert results
        assert.strictEqual(response.statusCode, 200, 'Unexpected HTTP status code');
        assert.strictEqual(response.body.regions.length, 1, 'Unexpected regions claim');
    });

    /*
     * Test getting claims for the admin user
     */
    it ('Get user claims returns all regions for the admin user', async () => {

        // Get an access token for the end user of this test
        const accessToken = await tokenIssuer.issueAccessToken(guestAdminId);

        // The API will call the Authorization Server to get user info for the token, so register a mock response
        const mockUserInfo = {
            given_name: 'Admin',
            family_name: 'User',
            email: 'guestadmin@mycompany.com',
        };
        await wiremockAdmin.registerUserInfo(JSON.stringify(mockUserInfo));

        // Call the API
        const options = new ApiRequestOptions(accessToken);
        const response = await apiClient.getUserInfoClaims(options);

        // Assert results
        assert.strictEqual(response.statusCode, 200, 'Unexpected HTTP status code');
        assert.strictEqual(response.body.regions.length, 3, 'Unexpected regions claim');
    });

    /*
     * Test getting companies
     */
    it ('Get companies list returns 2 items for the standard user', async () => {

        // Get an access token for the end user of this test
        const accessToken = await tokenIssuer.issueAccessToken(guestUserId);

        // The API will call the Authorization Server to get user info for the token, so register a mock response
        const mockUserInfo = {
            given_name: 'Guest',
            family_name: 'User',
            email: 'guestuser@mycompany.com',
        };
        await wiremockAdmin.registerUserInfo(JSON.stringify(mockUserInfo));

        // Call the API
        const options = new ApiRequestOptions(accessToken);
        const response = await apiClient.getCompanyList(options);

        // Assert results
        assert.strictEqual(response.statusCode, 200, 'Unexpected HTTP status code');
        assert.strictEqual(response.body.length, 2, 'Unexpected companies list');
    });

    /*
     * Test getting companies for the admin user
     */
    it ('Get companies list returns all items for the admin user', async () => {

        // Get an access token for the end user of this test
        const accessToken = await tokenIssuer.issueAccessToken(guestAdminId);

        // The API will call the Authorization Server to get user info for the token, so register a mock response
        const mockUserInfo = {
            given_name: 'Admin',
            family_name: 'User',
            email: 'guestadmin@mycompany.com',
        };
        await wiremockAdmin.registerUserInfo(JSON.stringify(mockUserInfo));

        // Call the API
        const options = new ApiRequestOptions(accessToken);
        const response = await apiClient.getCompanyList(options);

        // Assert results
        assert.strictEqual(response.statusCode, 200, 'Unexpected HTTP status code');
        assert.strictEqual(response.body.length, 4, 'Unexpected companies list');
    });

    /*
     * Test getting companies with a malicious JWT
     */
    it ('Get companies list with malicious JWT returns a 401 error', async () => {

        // Get an access token for the end user of this test
        const accessToken = await tokenIssuer.issueMaliciousAccessToken(guestUserId);

        // Call the API
        const options = new ApiRequestOptions(accessToken);
        const response = await apiClient.getCompanyList(options);

        // Assert results
        assert.strictEqual(response.statusCode, 401, 'Unexpected HTTP status code');
        assert.strictEqual(response.body.code, 'unauthorized');
    });

    /*
     * Test getting allowed transactions
     */
    it ('Get transactions is allowed for companies that match the regions claim', async () => {

        // Get an access token for the end user of this test
        const accessToken = await tokenIssuer.issueAccessToken(guestUserId);

        // The API will call the Authorization Server to get user info for the token, so register a mock response
        const mockUserInfo = {
            given_name: 'Guest',
            family_name: 'User',
            email: 'guestuser@mycompany.com',
        };
        await wiremockAdmin.registerUserInfo(JSON.stringify(mockUserInfo));

        // Call the API
        const options = new ApiRequestOptions(accessToken);
        const response = await apiClient.getCompanyTransactions(options, 2);

        // Assert results
        assert.strictEqual(response.statusCode, 200, 'Unexpected HTTP status code');
        assert.strictEqual(response.body.transactions.length, 8, 'Unexpected transactions');
    });

    /*
     * Test getting unauthorized transactions
     */
    it ('Get transactions returns 404 for companies that do not match the regions claim', async () => {

        // Get an access token for the end user of this test
        const accessToken = await tokenIssuer.issueAccessToken(guestUserId);

        // The API will call the Authorization Server to get user info for the token, so register a mock response
        const mockUserInfo = {
            given_name: 'Guest',
            family_name: 'User',
            email: 'guestuser@mycompany.com',
        };
        await wiremockAdmin.registerUserInfo(JSON.stringify(mockUserInfo));

        // Call the API
        const options = new ApiRequestOptions(accessToken);
        const response = await apiClient.getCompanyTransactions(options, 3);

        // Assert results
        assert.strictEqual(response.statusCode, 404, 'Unexpected HTTP status code');
        assert.strictEqual(response.body.code, 'company_not_found', 'Unexpected error code');
    });

    /*
     * Rehearse an API 500 error
     */
    it ('API exceptions return 500 with a supportable error response', async () => {

        // Get an access token for the end user of this test
        const accessToken = await tokenIssuer.issueAccessToken(guestUserId);

        // The API will call the Authorization Server to get user info for the token, so register a mock response
        const mockUserInfo = {
            given_name: 'Guest',
            family_name: 'User',
            email: 'guestuser@mycompany.com',
        };
        await wiremockAdmin.registerUserInfo(JSON.stringify(mockUserInfo));

        // Call a valid API operation but pass a custom header to cause an API exception
        const options = new ApiRequestOptions(accessToken);
        options.rehearseException = true;
        const response = await apiClient.getCompanyTransactions(options, 2);

        // Assert results
        assert.strictEqual(response.statusCode, 500, 'Unexpected HTTP status code');
        assert.strictEqual(response.body.code, 'exception_simulation', 'Unexpected error code');
    });
});
