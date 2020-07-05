import {injectable} from 'inversify';

/*
 * Common API claims used by all APIs
 */
@injectable()
export class CoreApiClaims {

    // Token claims
    private _userId!: string;
    private _clientId!: string;
    private _scopes!: string[];
    private _expiry!: number;

    // Data from the OAuth user info endpoint
    private _givenName!: string;
    private _familyName!: string;
    private _email!: string;

    /*
     * Accessors
     */
    public get userId(): string {
        return this._userId;
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

    /*
     * Set token claims after introspection
     */
    public setTokenInfo(userId: string, clientId: string, scopes: string[], expiry: number) {
        this._userId = userId;
        this._clientId = clientId;
        this._scopes = scopes;
        this._expiry = expiry;
    }

    /*
     * Set informational fields after user info lookup
     */
    public setCentralUserInfo(givenName: string, familyName: string, email: string) {
        this._givenName = givenName;
        this._familyName = familyName;
        this._email = email;
    }
}
