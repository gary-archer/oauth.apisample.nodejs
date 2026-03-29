/*
 * Some options suitable for our API tests
 */
export class ApiRequestOptions {
    accessToken;
    httpMethod;
    apiPath;
    rehearseException;
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.httpMethod = '';
        this.apiPath = '';
        this.rehearseException = false;
    }
    getAccessToken() {
        return this.accessToken;
    }
    setHttpMethod(value) {
        this.httpMethod = value;
    }
    getHttpMethod() {
        return this.httpMethod;
    }
    setApiPath(value) {
        this.apiPath = value;
    }
    getApiPath() {
        return this.apiPath;
    }
    setRehearseException(value) {
        this.rehearseException = value;
    }
    getRehearseException() {
        return this.rehearseException;
    }
}
