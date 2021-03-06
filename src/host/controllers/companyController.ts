import {inject} from 'inversify';
import {BaseHttpController, controller, httpGet, requestParam} from 'inversify-express-utils';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {SAMPLETYPES} from '../../logic/dependencies/sampleTypes';
import {Company} from '../../logic/entities/company';
import {CompanyTransactions} from '../../logic/entities/companyTransactions';
import {ErrorCodes} from '../../logic/errors/errorCodes';
import {CompanyService} from '../../logic/services/companyService';

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
     * Return the list of companies
     */
    @httpGet('')
    public async getCompanyList(): Promise<Company[]> {

        return this._service.getCompanyList();
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

        return this._service.getCompanyTransactions(companyId);
    }
}
