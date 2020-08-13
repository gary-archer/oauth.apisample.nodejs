import {inject} from 'inversify';
import {BaseHttpController, controller, httpGet, requestParam} from 'inversify-express-utils';
import {BASETYPES} from '../../plumbing/dependencies/baseTypes';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {SAMPLETYPES} from '../../logic/dependencies/sampleTypes';
import {Company} from '../../logic/entities/company';
import {CompanyTransactions} from '../../logic/entities/companyTransactions';
import {ErrorCodes} from '../../logic/errors/errorCodes';
import {CompanyService} from '../../logic/services/companyService';
import {SampleApiClaims} from '../claims/sampleApiClaims';

/*
 * Our API controller runs after claims handling has completed
 */
@controller('/companies')
export class CompanyController extends BaseHttpController {

    private readonly _service: CompanyService;
    private readonly _claims: SampleApiClaims;

    public constructor(
        @inject(BASETYPES.CoreApiClaims) claims: SampleApiClaims,
        @inject(SAMPLETYPES.CompanyService) service: CompanyService) {

        super();
        this._service = service;
        this._claims = claims;
    }

    /*
     * Return the list of companies
     */
    @httpGet('')
    public async getCompanyList(): Promise<Company[]> {

        // Do the work of the operation
        return this._service.getCompanyList(this._claims.regionsCovered);
    }

    /*
     * Return the transaction details for a company
     */
    @httpGet('/:id/transactions')
    public async getCompanyTransactions(@requestParam('id') id: string): Promise<CompanyTransactions> {

        const companyId = parseInt(id, 10);
        if (isNaN(companyId) || companyId <= 0) {

            // Throw a 400 error if we have an invalid id
            throw ErrorFactory.createClientError(
                400,
                ErrorCodes.invalidCompanyId,
                'The company id must be a positive numeric integer');
        }

        return this._service.getCompanyTransactions(companyId, this._claims.regionsCovered);
    }
}
