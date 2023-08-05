import assert from 'assert';
import {Guid} from 'guid-typescript';
import {generateKeyPair} from 'jose';
import {ExtraCaCerts} from '../src/plumbing/utilities/extraCaCerts.js';
import {ApiClient} from './utils/apiClient.js';
import {ApiRequestOptions} from './utils/apiRequestOptions.js';
import {MockAuthorizationServer} from './utils/mockAuthorizationServer.js';

/*
 * Test the API in isolation, without any dependencies on real access tokens
 */
describe('OAuth API Tests', () => {

    // The real subject claim values for my two online test users
    const guestUserId  = 'a6b404b1-98af-41a2-8e7f-e4061dc0bf86';
    const guestAdminId = '77a97e5b-b748-45e5-bb6f-658e85b2df91';

    // A class to issue our own JWTs for testing
    const authorizationServer = new MockAuthorizationServer(false);

    // Create the API client
    const apiBaseUrl = 'https://apilocal.authsamples-dev.com:446';
    const sessionId = Guid.create().toString();
    const apiClient = new ApiClient(apiBaseUrl, 'IntegrationTests', sessionId, false);

    /*
     * Run a mock authorization server during tests
     */
    before( async () => {
        
        ExtraCaCerts.initialize();
        await authorizationServer.start();
    });

    /*
     * Teardown that runs when all tests have completed
     */
    after( async () => {
        await authorizationServer.stop();
    });

    /*
     * Test getting claims
     */
    it ('Get user claims returns a single region for the standard user', async () => {

        // Get an access token for the end user of this test
        const accessToken = await authorizationServer.issueAccessToken(guestUserId);

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
        const accessToken = await authorizationServer.issueAccessToken(guestAdminId);

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
        const accessToken = await authorizationServer.issueAccessToken(guestUserId);

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
        const accessToken = await authorizationServer.issueAccessToken(guestAdminId);

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
        const maliciousJwk = await generateKeyPair('RS256');
        const accessToken = await authorizationServer.issueAccessToken(guestUserId, maliciousJwk);

        // Call the API
        const options = new ApiRequestOptions(accessToken);
        const response = await apiClient.getCompanyList(options);

        // Assert results
        assert.strictEqual(response.statusCode, 401, 'Unexpected HTTP status code');
        assert.strictEqual(response.body.code, 'invalid_token', 'Unexpected error code');
    });

    /*
     * Test getting allowed transactions
     */
    it ('Get transactions is allowed for companies that match the regions claim', async () => {

        // Get an access token for the end user of this test
        const accessToken = await authorizationServer.issueAccessToken(guestUserId);

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
        const accessToken = await authorizationServer.issueAccessToken(guestUserId);

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
        const accessToken = await authorizationServer.issueAccessToken(guestUserId);

        // Call a valid API operation but pass a custom header to cause an API exception
        const options = new ApiRequestOptions(accessToken);
        options.rehearseException = true;
        const response = await apiClient.getCompanyTransactions(options, 2);

        // Assert results
        assert.strictEqual(response.statusCode, 500, 'Unexpected HTTP status code');
        assert.strictEqual(response.body.code, 'exception_simulation', 'Unexpected error code');
    });
});
