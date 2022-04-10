import axios, {AxiosRequestConfig} from 'axios';
import {Guid} from 'guid-typescript';
import {HttpProxy} from '../../src/plumbing/utilities/httpProxy';
import {ApiRequestOptions} from './apiRequestOptions';
import {ApiResponse} from './apiResponse';
import {ApiResponseMetrics} from './apiResponseMetrics';

/*
 * A utility class to call the API in a parameterized manner
 */
export class ApiClient {

    private readonly _baseUrl: string;
    private readonly _clientName: string;
    private readonly _sessionId: string;
    private readonly _httpProxy: HttpProxy;

    public constructor(baseUrl: string, clientName: string, sessionId: string, useProxy: boolean) {
        this._baseUrl = baseUrl;
        this._clientName = clientName;
        this._sessionId = sessionId;
        this._httpProxy = new HttpProxy(useProxy, 'http://127.0.0.1:8888');
    }

    public async getUserInfoClaims(options: ApiRequestOptions): Promise<ApiResponse> {

        const metrics = {
            operation: 'getUserInfoClaims',
        } as ApiResponseMetrics;

        return this._callApi(options, metrics);
    }

    public async getCompanyList(options: ApiRequestOptions): Promise<ApiResponse> {

        const metrics = {
            operation: 'getCompanyList',
        } as ApiResponseMetrics;

        return this._callApi(options, metrics);
    }

    public async getCompanyTransactions(options: ApiRequestOptions): Promise<ApiResponse> {

        const metrics = {
            operation: 'getCompanyTransactions',
        } as ApiResponseMetrics;

        return this._callApi(options, metrics);
    }

    private async _callApi(requestOptions: ApiRequestOptions, metrics: ApiResponseMetrics): Promise<ApiResponse> {

        metrics.startTime = new Date();
        metrics.correlationId = Guid.create().toString();
        const hrtimeStart = process.hrtime();

        const options = {
            url: this._baseUrl + requestOptions.apiPath,
            method: requestOptions.httpMethod,
            headers: {
                authorization: `Bearer ${requestOptions.accessToken}`,
                'x-mycompany-api-client': this._clientName,
                'x-mycompany-session-id': this._sessionId,
                'x-mycompany-correlation-id': metrics.correlationId,
            },
            httpsAgent: this._httpProxy.agent,
        } as AxiosRequestConfig;

        if (requestOptions.rehearseException) {
            options.headers!['x-mycompany-test-exception'] = 'SampleApi';
        }

        try {

            const axiosResponse = await axios(options);

            return {
                statusCode: axiosResponse.status,
                body: axiosResponse.data,
                metrics,
            };

        } catch (e: any) {

            if (e.response && e.response.status && e.response.data && typeof e.response.data === 'object') {

                // Return JSON error responses
                return {
                    statusCode: e.response.status,
                    body: e.response.data,
                    metrics,
                };

            } else {

                // Rethrow connectivity errors, which will stop the load test
                throw e;
            }
        } finally {

            // Report the time taken
            const hrtimeEnd = process.hrtime(hrtimeStart);
            metrics.millisecondsTaken = Math.floor((hrtimeEnd[0] * 1000000000 + hrtimeEnd[1]) / 1000000);
        }
    }
}
