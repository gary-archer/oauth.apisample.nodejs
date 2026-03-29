import { randomUUID } from 'crypto';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { fetch } from 'undici';
import { HttpProxy } from '../../src/plumbing/utilities/httpProxy.js';
/*
 * A mock authorization server implemented with wiremock and a JOSE library
 */
export class MockAuthorizationServer {
    baseUrl;
    httpProxy;
    algorithm;
    keypair;
    keyId;
    constructor(useProxy) {
        this.baseUrl = 'https://login.authsamples-dev.com:447/__admin/mappings';
        this.httpProxy = new HttpProxy(useProxy, 'http://127.0.0.1:8888');
        this.algorithm = 'ES256';
        this.keyId = randomUUID();
    }
    /*
     * Create resources at the start of the test run
     */
    async start() {
        // Generate a JSON Web Key for our token issuing
        this.keypair = await generateKeyPair(this.algorithm);
        // Get the JSON Web Key Set containing the public key
        const jwk = await exportJWK(this.keypair.publicKey);
        jwk.kid = this.keyId;
        jwk.alg = this.algorithm;
        const keys = {
            keys: [
                jwk,
            ],
        };
        const keysJson = JSON.stringify(keys);
        // Publish the public keys at a Wiremock JWKS URI
        const stubbedResponse = {
            id: this.keyId,
            priority: 1,
            request: {
                method: 'GET',
                url: '/.well-known/jwks.json'
            },
            response: {
                status: 200,
                body: keysJson,
            },
        };
        await this.register(stubbedResponse);
    }
    /*
     * Free resources at the end of the test run
     */
    async stop() {
        await this.unregister(this.keyId);
    }
    /*
     * Issue an access token with the supplied user and other test options
     */
    async issueAccessToken(options, keypair = null) {
        const keypairToUse = keypair || this.keypair;
        const payload = {
            iss: options.issuer,
            aud: options.audience,
            scope: options.scope,
            delegation_id: options.delegationId,
            client_id: 'TestClient',
            sub: options.subject,
            manager_id: options.managerId,
            role: options.role,
        };
        return await new SignJWT(payload)
            .setProtectedHeader({ kid: this.keyId, alg: this.algorithm })
            .setExpirationTime(options.expiryTime)
            .sign(keypairToUse.privateKey);
    }
    /*
     * Add a stubbed response to Wiremock via its Admin API
     */
    async register(stubbedResponse) {
        const options = {
            method: 'POST',
            body: JSON.stringify(stubbedResponse),
            headers: {
                'content-type': 'application/json',
            },
            dispatcher: this.httpProxy.getDispatcher() || undefined,
        };
        const response = await fetch(this.baseUrl, options);
        if (response.status !== 201) {
            throw new Error(`Failed to add Wiremock stub: status ${response.status}`);
        }
    }
    /*
     * Delete a stubbed response from Wiremock via its Admin API
     */
    async unregister(id) {
        const options = {
            method: 'DELETE',
            dispatcher: this.httpProxy.getDispatcher() || undefined,
        };
        const response = await fetch(`${this.baseUrl}/${id}`, options);
        if (response.status !== 200) {
            throw new Error(`Failed to delete Wiremock stub: status ${response.status}`);
        }
    }
}
