import {injectable} from 'inversify';
import {SampleExtraClaims} from '../claims/sampleExtraClaims.js';

/*
 * A repository that returns hard coded data, whereas a real implementation would use a database lookup
 */
@injectable()
export class UserRepository {

    /*
     * Receive the manager ID in the access token, as a useful API identity, then look up extra claims
     * This is the preferred model, since it locks down the access token and provides the most useful API user identity
     */
    public getClaimsForManagerId(managerId: string): SampleExtraClaims {

        if (managerId === '20116') {

            // These claims are used for the guestadmin@mycompany.com user account
            return new SampleExtraClaims('Global Manager', ['Europe', 'USA', 'Asia']);

        } else if (managerId == '10345') {

            // These claims are used for the guestuser@mycompany.com user account
            return new SampleExtraClaims('Regional Manager', ['USA']);

        } else {

            // Use empty claims for unrecognized users
            return new SampleExtraClaims('', []);
        }
    }

    /*
     * Receive the subject claim from the access token and look up all other claims
     * This is less optimal, since the token is less locked down and the API must map the subject to other values
     */
    public getClaimsForSubject(subject: string): SampleExtraClaims {

        if (subject === '77a97e5b-b748-45e5-bb6f-658e85b2df91') {

            // These claims are used for the guestadmin@mycompany.com user account
            const claims = new SampleExtraClaims('Global Manager', ['Europe', 'USA', 'Asia']);
            claims.addCoreClaims('20116', 'admin');
            return claims;

        } else if (subject === 'a6b404b1-98af-41a2-8e7f-e4061dc0bf86') {

            // These claims are used for the guestuser@mycompany.com user account
            const claims = new SampleExtraClaims('Regional Manager', ['USA']);
            claims.addCoreClaims('10345', 'user');
            return claims;

        } else {

            // Use empty claims for unrecognized users
            const claims = new SampleExtraClaims('', []);
            claims.addCoreClaims('', '');
            return claims;
        }
    }
}
