/*
 * User info claims can be returned to the UI or API
 */
export class UserInfoClaims {

    /*
     * These fields originate from the Authorization Server
     */
    private _givenName: string;
    private _familyName: string;
    private _email: string;

    /*
     * Construct from input
     */
    public constructor(givenName: string, familyName: string, email: string) {
        this._givenName = givenName;
        this._familyName = familyName;
        this._email = email;
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
}
