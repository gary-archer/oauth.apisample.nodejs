import {BaseHttpController, controller, httpGet, requestParam} from 'inversify-express-utils';

/*
 * A controller called during token issuing to ask the API for custom claim values
 * This is not used by Cognito and requires the ability for the Authorization Server to call the API
 */
@controller('/customclaims')
export class ClaimsController extends BaseHttpController {

    /*
     * Return custom claims for the supplied subject value from the Authorization Server
     */
    @httpGet('/:subject')
    public async getCustomClaims(@requestParam('subject') subject: string): Promise<any> {

        if (subject.indexOf('admin') !== -1) {

            return {
                user_database_id: 10345,
                user_role: 'admin',
                user_regions: [],
            };

        } else {

            return {
                user_database_id: 20112,
                user_role: 'user',
                user_regions: ['USA'],
            };
        }
    }
}
