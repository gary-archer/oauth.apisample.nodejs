/*
 * Represents finer grained authorization values not issued to access tokens
 * These values are often easier to manage in APIs rather than the authorization server
 */
export class ExtraClaims {

    public title: string;
    public regions: string[];

    public constructor(title: string, regions: string[]) {
        this.title = title;
        this.regions = regions;
    }
}
