import {ExtraClaims} from '../../plumbing/claims/extraClaims.js';

/*
 * Represents finer grained permissions not issued to access tokens
 * These values are often easier to manage outside of business data
 */
export class SampleExtraClaims extends ExtraClaims {

    private readonly _title: string;
    private readonly _regions: string[];

    public static importData(data: any): SampleExtraClaims {
        return new SampleExtraClaims(data.title, data.regions);
    }

    public constructor(title: string, regions: string[]) {
        super();
        this._title = title;
        this._regions = regions;
    }

    public get title(): string {
        return this._title;
    }

    public get regions(): string[] {
        return this._regions;
    }

    public exportData(): any {

        return {
            title: this._title,
            regions: this._regions,
        };
    }
}
