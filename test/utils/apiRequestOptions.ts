/*
 * Some options suitable for our API tests
 */
export class ApiRequestOptions {

    private readonly _accessToken: string;
    private _httpMethod: string;
    private _apiPath: string;
    private _rehearseException: boolean;

    public constructor(accessToken: string) {
        this._accessToken = accessToken;
        this._httpMethod = '';
        this._apiPath = '';
        this._rehearseException = false;
    }

    public get accessToken(): string {
        return this._accessToken;
    }

    public set httpMethod(value: string) {
        this._httpMethod = value;
    }

    public get httpMethod(): string {
        return this._httpMethod;
    }

    public set apiPath(value: string) {
        this._apiPath = value;
    }

    public get apiPath(): string {
        return this._apiPath;
    }

    public set rehearseException(value: boolean) {
        this._rehearseException = value;
    }

    public get rehearseException(): boolean {
        return this._rehearseException;
    }
}
