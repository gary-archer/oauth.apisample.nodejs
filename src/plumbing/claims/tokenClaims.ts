/*
 * Claims included in the JWT
 */
export class TokenClaims {

    private _subject: string;
    private _clientId: string;
    private _scopes: string[];
    private _expiry: number;

    public static import(data: any): TokenClaims {
        return new TokenClaims(data.subject, data.clientId, data.scopes, data.expiry);
    }

    public constructor(subject: string, clientId: string, scopes: string[], expiry: number) {
        this._subject = subject;
        this._clientId = clientId;
        this._scopes = scopes;
        this._expiry = expiry;
    }

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

    public export(): any {

        return {
            'subject': this._subject,
            'clientId': this._clientId,
            'scopes': this._scopes,
            'expiry': this._expiry,
        };
    }
}
