import {Request, Response} from 'express';
import {inject} from 'inversify';
import {controller, httpGet} from 'inversify-express-utils';
import {TYPES} from '../../dependencies/types';
import {ClientError} from '../../framework';
import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';
import {CompanyRepository} from '../repositories/companyRepository';
import {BaseApiController} from './baseApiController';

/*
 * Our API controller runs after claims handling has completed
 */
@controller('/companies')
export class CompanyController extends BaseApiController {

    // Injected dependencies
    private readonly _repository: CompanyRepository;

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
    public async getCompanyList(request: Request, response: Response): Promise<Company[]> {

        // Log details the framework cannot derive
        super.setOperationName(request, this.getCompanyList.name);

        // Do the work of the operation
        return await this._repository.getCompanyList();
    }

    /*
     * Return the transaction details for a company
     */
    @httpGet('/:id/transactions')
    public async getCompanyTransactions(request: Request, response: Response): Promise<CompanyTransactions> {

        const id = request.params.id;

        // Log details the framework cannot derive
        super.setOperationName(request, this.getCompanyTransactions.name);
        super.setResourceId(request, [id]);

        // Throw a 400 error if we have an invalid id
        const idValue = parseInt(id, 10);
        if (isNaN(idValue) || idValue <= 0) {
            throw new ClientError(400, 'invalid_company_id', 'The company id must be a positive numeric integer');
        }

        return await this._repository.getCompanyTransactions(idValue);
    }
}
