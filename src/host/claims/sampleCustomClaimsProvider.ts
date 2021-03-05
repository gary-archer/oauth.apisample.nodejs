import {SampleCustomClaims} from '../../logic/entities/sampleCustomClaims';
import {ApiClaims} from '../../plumbing/claims/apiClaims';
import {CustomClaims} from '../../plumbing/claims/customClaims';
import {CustomClaimsProvider} from '../../plumbing/claims/customClaimsProvider';
import {TokenClaims} from '../../plumbing/claims/tokenClaims';
import {UserInfoClaims} from '../../plumbing/claims/userInfoClaims';

/*
 * An example of including domain specific details in cached claims
 */
export class SampleCustomClaimsProvider implements CustomClaimsProvider {

    /*
     * An example of how custom claims can be included
     */
    public async getCustomClaims(token: TokenClaims, userInfo: UserInfoClaims): Promise<CustomClaims> {

        // A real implementation would look up the database user id from the subject and / or email claim
        const email = userInfo.email;
        const userDatabaseId = '10345';

        // Our blog's code samples have two fixed users and we use the below mock implementation:
        // - guestadmin@mycompany.com is an admin and sees all data
        // - guestuser@mycompany.com is not an admin and only sees data for the USA region
        const isAdmin = email.toLowerCase().indexOf('admin') !== -1;
        const regionsCovered = isAdmin? [] : ['USA'];

        return new SampleCustomClaims(userDatabaseId, isAdmin, regionsCovered);
    }

    /*
     * Serialize claims when requested, and use the concrete claims class
     */
    public serialize(claims: ApiClaims): string {

        const data = {
            token: claims.token.export(),
            userInfo: claims.userInfo.export(),
            custom: (claims.custom as SampleCustomClaims).export(),
        };

        return JSON.stringify(data);
    }

    /*
     * Read the claims parts, and use the concrete claims class
     */
    public  deserialize(claimsText: string): ApiClaims {

        const data = JSON.parse(claimsText);

        return new ApiClaims(
            TokenClaims.import(data.token),
            UserInfoClaims.import(data.userInfo),
            SampleCustomClaims.import(data.custom)
        );
    }
}
