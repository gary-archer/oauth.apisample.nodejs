import {injectable} from 'inversify';

/*
 * Common API claims used by all APIs
 */
@injectable()
export class CoreApiClaims {

    /*
     * Give fields default values
     */
    public constructor() {
        this._subject = '';
        this._clientId = '';
        this._scopes = [];
        this._expiry = 0;
        this._givenName = '';
        this._familyName = '';
        this._email = '';
        this._userDatabaseId = '';
    }

    // Token claims
    private _subject: string;
    private _clientId: string;
    private _scopes: string[];
    private _expiry: number;

    // Data from the OAuth user info endpoint
    private _givenName: string;
    private _familyName: string;
    private _email: string;

    // The database primary key from the API's own database
    private _userDatabaseId!: string;

    // Accessors
    public get subject(): string {
        return this._subject;
    }

    public get clientId(): string {
        return this._clientId;
    }

    public get scopes(): string[] {
        return this._scopes;
    }

    public get expiry(): number {
        return this._expiry;
    }

    public get givenName(): string {
        return this._givenName;
    }

    public get familyName(): string {
        return this._familyName;
    }

    public get email(): string {
        return this._email;
    }

    public get userDatabaseId(): string {
        return this._userDatabaseId;
    }

    public set userDatabaseId(value: string) {
        this._userDatabaseId = value;
    }

    /*
     * Set claims from the OAuth 2.0 access token
     */
    public setTokenInfo(subject: string, clientId: string, scopes: string[], expiry: number) {
        this._subject = subject;
        this._clientId = clientId;
        this._scopes = scopes;
        this._expiry = expiry;
    }

    /*
     * Set claims from the OAuth 2.0 user info endpoint
     */
    public setCentralUserInfo(givenName: string, familyName: string, email: string) {
        this._givenName = givenName;
        this._familyName = familyName;
        this._email = email;
    }
}
