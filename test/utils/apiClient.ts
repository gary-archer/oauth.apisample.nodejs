import axios, {AxiosRequestConfig} from 'axios';
import {HttpProxy} from '../../src/plumbing/utilities/httpProxy';
import {ApiClientOptions} from './apiClientOptions';

/*
 * A utility class to call the API in a parameterized manner
 */
export class ApiClient {

    private readonly _baseUrl: string;
    private readonly _sessionId: string;
    private readonly _httpProxy: HttpProxy;

    public constructor(baseUrl: string, sessionId: string, useProxy: boolean) {
        this._baseUrl = baseUrl;
        this._sessionId = sessionId;
        this._httpProxy = new HttpProxy(useProxy, 'http://127.0.0.1:8888');
    }

    public async callApi(requestOptions: ApiClientOptions): Promise<any> {

        const options = {
            url: this._baseUrl + requestOptions.apiPath,
            method: requestOptions.httpMethod,
            headers: {
                authorization: `Bearer ${requestOptions.accessToken}`,
                'x-mycompany-api-client': 'ServerlessTest',
                'x-mycompany-session-id': this._sessionId,
            },
            httpsAgent: this._httpProxy.agent,
        } as AxiosRequestConfig;

        if (requestOptions.rehearseException) {
            options.headers!['x-mycompany-test-exception'] = 'SampleApi';
        }

        try {

            // Return JSON success responses
            const response = await axios(options);
            return {
                statusCode: response.status,
                body: response.data,
            };

        } catch (e: any) {

            if (e.response && e.response.status && e.response.data && typeof e.response.data === 'object') {

                // Return JSON error responses
                return {
                    statusCode: e.response.status,
                    body: e.response.data,
                };

            } else {

                // Rethrow connectivity errors
                throw e;
            }
        }
    }
}
