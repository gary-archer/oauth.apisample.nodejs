import {inject} from 'inversify';
import {BaseHttpController, controller, httpGet, requestParam} from 'inversify-express-utils';
import {SAMPLETYPES} from '../../logic/dependencies/sampleTypes.js';
import {Company} from '../../logic/entities/company.js';
import {CompanyTransactions} from '../../logic/entities/companyTransactions.js';
import {ErrorCodes} from '../../logic/errors/errorCodes.js';
import {CompanyService} from '../../logic/services/companyService.js';
import {ErrorFactory} from '../../plumbing/errors/errorFactory.js';

/*
 * Our API controller runs after claims handling has completed
 */
@controller('/companies')
export class CompanyController extends BaseHttpController {

    private readonly _service: CompanyService;

    public constructor(@inject(SAMPLETYPES.CompanyService) service: CompanyService) {

        super();
        this._service = service;
    }

    /*
     * Return a list of companies
     */
    @httpGet('')
    public async getCompanyList(): Promise<Company[]> {
        return this._service.getCompanyList();
    }

    /*
     * Return a composite object containing company transactions
     */
    @httpGet('/:id/transactions')
    public async getCompanyTransactions(@requestParam('id') id: string): Promise<CompanyTransactions> {

        // Parse the ID and throw a 400 error if it is invalid
        const companyId = parseInt(id, 10);
        if (isNaN(companyId) || companyId <= 0) {

            throw ErrorFactory.createClientError(
                400,
                ErrorCodes.invalidCompanyId,
                'The company id must be a positive numeric integer');
        }

        // Next authorize access based on claims
        return this._service.getCompanyTransactions(companyId);
    }
}
