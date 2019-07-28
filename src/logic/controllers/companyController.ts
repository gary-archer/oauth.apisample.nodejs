import {Request, Response} from 'express';
import {inject, injectable} from 'inversify';
import {TYPES} from '../../dependencies/types';
import {ClientError, ResponseWriter} from '../../framework';
import {CompanyRepository} from '../repositories/companyRepository';

/*
 * Our API controller runs after claims handling has completed
 */
@injectable()
export class CompanyController {

    private readonly _repository: CompanyRepository;

    public constructor(@inject(TYPES.CompanyRepository) repository: CompanyRepository) {
        this._repository = repository;
        this._setupCallbacks();
    }

    /*
     * Return the list of companies
     */
    public async getCompanyList(request: Request, response: Response): Promise<void> {
        const companies = await this._repository.getCompanyList();
        new ResponseWriter().writeObjectResponse(response, 200, companies);
    }

    /*
     * Return the transaction details for a company
     */
    public async getCompanyTransactions(request: Request, response: Response): Promise<void> {

        // Get the supplied id as a number, and return 400 if invalid input was received
        const id = parseInt(request.params.id, 10);
        if (isNaN(id) || id <= 0) {
            throw new ClientError(400, 'invalid_company_id', 'The company id must be a positive numeric integer');
        }

        const transactions = await this._repository.getCompanyTransactions(id);
        new ResponseWriter().writeObjectResponse(response, 200, transactions);
    }

    /*
     * Plumbing to ensure the this parameter is available
     */
    private _setupCallbacks(): void {
        this.getCompanyList = this.getCompanyList.bind(this);
        this.getCompanyTransactions = this.getCompanyTransactions.bind(this);
    }
}
