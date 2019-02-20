import {inject} from 'inversify';
import {BaseHttpController, controller, httpGet, requestParam} from 'inversify-express-utils';
import {TYPES} from '../../plumbing/dependencies/types';
import {UserContextAccessor} from '../../plumbing/dependencies/userContextAccessor';
import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';
import {CompanyRepository} from '../repositories/companyRepository';

/*
 * Our API controller runs after claims handling has completed
 */
@controller('/companies', TYPES.UserContextAccessor)
export class CompanyController extends BaseHttpController {

    /*
     * The repository is injected
     */
    private _repository: CompanyRepository;

    /*
     * Receive dependencies
     */
    public constructor(@inject(TYPES.CompanyRepository) repository: CompanyRepository) {
        super();
        this._repository = repository;
    }

    /*
     * Return the list of companies
     */
    @httpGet('/')
     public async getCompanyList(): Promise<Company[]> {
        return await this._repository.getCompanyList();
    }

    /*
     * Return the transaction details for a company
     */
    @httpGet('/:id/transactions')
     public async getCompanyTransactions(@requestParam('id') id: string): Promise<CompanyTransactions> {

        // TODO: Report non number errors properly
        const idValue = parseInt(id, 10);
        return await this._repository.getCompanyTransactions(idValue);
    }
}
