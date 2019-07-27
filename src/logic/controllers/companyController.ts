import {inject} from 'inversify';
import {Controller, Get, Path, Route} from 'tsoa';
import {TYPES} from '../../dependencies/types';
import {ClientError} from '../../framework';
import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';
import {CompanyRepository} from '../repositories/companyRepository';

/*
 * Our API controller runs after claims handling has completed
 */
@Route('/companies')
export class CompanyController extends Controller {

    private readonly _repository: CompanyRepository;

    public constructor(@inject(TYPES.CompanyRepository) repository: CompanyRepository) {
        super();
        this._repository = repository;
    }

    /*
     * Return the list of companies
     */
    @Get('/')
    public async getCompanyList(): Promise<Company[]> {
        return await this._repository.getCompanyList();
    }

    /*
     * Return the transaction details for a company
     */
    @Get('/{id}/transactions')
    public async getCompanyTransactions(@Path('id') id: string): Promise<CompanyTransactions> {

        // Throw a 400 error if we have an invalid id
        const idValue = parseInt(id, 10);
        if (isNaN(idValue) || idValue <= 0) {
            throw new ClientError(400, 'invalid_company_id', 'The company id must be a positive numeric integer');
        }

        return await this._repository.getCompanyTransactions(idValue);
    }
}
