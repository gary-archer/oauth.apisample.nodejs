import {UserInfoClaims} from './userInfoClaims';

/*
 * Common API claims that our code OAuth plumbing understands
 */
export class CoreApiClaims {

    // The immutable user id from the access token, which may exist in the API's database
    private _userId!: string;

    // The client id, which typically represents the calling application
    private _clientId!: string;

    // OAuth scopes can represent high level areas of the business
    private _scopes!: string[];

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

    /*
     * Set token claims after introspection
     */
    public setTokenInfo(userId: string, clientId: string, scopes: string[]) {
        this._userId = userId;
        this._clientId = clientId;
        this._scopes = scopes;
    }

    /*
     * Set informational fields after user info lookup
     */
    public setCentralUserInfo(givenName: string, familyName: string, email: string) {
        this._givenName = givenName;
        this._familyName = familyName;
        this._email = email;
    }

    /*
     * Return user info fields as an entity
     */
    public getCentralUserInfo(): UserInfoClaims {

        return {
            givenName: this._givenName,
            familyName: this._familyName,
            email: this._email,
        } as UserInfoClaims;
    }

    /*
     * Include private fields when serializing claims to the claims cache
     */
    public serializePrivateFields(): any {
        return {
            userId: this._userId,
            clientId: this._clientId,
            scopes: this._scopes,
            givenName: this._givenName,
            familyName: this._familyName,
            email: this._email,
        };
    }

    /*
     * Set private fields when deserializing claims from the claims cache
     */
    public deserializePrivateFields(data: any): void {
        this.setTokenInfo(data.userId, data.clientId, data.scopes);
        this.setCentralUserInfo(data.givenName, data.familyName, data.email);
    }
}
