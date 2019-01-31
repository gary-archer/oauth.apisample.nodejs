/*
 * Manage errors due to invalid client usage
 */
export class ClientError extends Error {

    /*
     * Fields
     */
    private _statusCode: number;
    private _area: string;
    private _id: number | null;

    /*
     * Let callers supply a subset of named parameters via object destructuring
     */
    public constructor(statusCode: number, area: string, message: string) {

        super(message);
        this._statusCode = statusCode;
        this._area = area;
        this._id = null;

        // Ensure that instanceof works
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public get statusCode(): number {
        return this._statusCode;
    }

    public get area(): string {
        return this._area;
    }

    public get id(): number | null {
        return this._id;
    }

    public set id(id: number | null) {
        this._id = id;
    }

    /*
     * Return an object that can be serialized by calling JSON.stringify
     */
    public toResponseFormat(): any {

        const body: any = {
            area: this._area,
            message: this.message,
        };

        if (this._id) {
            body.id = this._id;
        }

        return body;
    }

    /*
     * Similar to the above but includes the status code
     */
    public toLogFormat(): any {

        return {
            statusCode: this._statusCode,
            body: this.toResponseFormat(),
        };
    }
}
