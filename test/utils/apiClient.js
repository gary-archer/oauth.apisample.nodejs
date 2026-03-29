import { randomUUID } from 'crypto';
import { fetch } from 'undici';
import { HttpProxy } from '../../src/plumbing/utilities/httpProxy.js';
/*
 * A utility class to call the API in a parameterized manner
 */
export class ApiClient {
    baseUrl;
    httpProxy;
    constructor(baseUrl, useProxy) {
        this.baseUrl = baseUrl;
        this.httpProxy = new HttpProxy(useProxy, 'http://127.0.0.1:8888');
    }
    async getUserInfoClaims(options) {
        options.setHttpMethod('GET');
        options.setApiPath('/investments/userinfo');
        const metrics = {
            operation: 'getUserInfoClaims',
        };
        return this.callApi(options, metrics);
    }
    async getCompanyList(options) {
        options.setHttpMethod('GET');
        options.setApiPath('/investments/companies');
        const metrics = {
            operation: 'getCompanyList',
        };
        return this.callApi(options, metrics);
    }
    async getCompanyTransactions(options, companyId) {
        options.setHttpMethod('GET');
        options.setApiPath(`/investments/companies/${companyId}/transactions`);
        const metrics = {
            operation: 'getCompanyTransactions',
        };
        return this.callApi(options, metrics);
    }
    async callApi(requestOptions, metrics) {
        metrics.startTime = new Date();
        metrics.correlationId = randomUUID();
        const hrtimeStart = process.hrtime();
        const headers = {
            authorization: `Bearer ${requestOptions.getAccessToken()}`,
            'correlation-id': metrics.correlationId,
        };
        const url = this.baseUrl + requestOptions.getApiPath();
        const options = {
            method: requestOptions.getHttpMethod(),
            headers,
            dispatcher: this.httpProxy.getDispatcher() || undefined,
        };
        if (requestOptions.getRehearseException()) {
            headers['api-exception-simulation'] = 'FinalApi';
        }
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                const responseData = await response.json();
                return {
                    statusCode: response.status,
                    body: responseData,
                    metrics,
                };
            }
            else {
                const errorData = await response.json();
                return {
                    statusCode: response.status,
                    body: errorData,
                    metrics,
                };
            }
        }
        finally {
            const hrtimeEnd = process.hrtime(hrtimeStart);
            metrics.millisecondsTaken = Math.floor((hrtimeEnd[0] * 1000000000 + hrtimeEnd[1]) / 1000000);
        }
    }
}
