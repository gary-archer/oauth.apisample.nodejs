import {inject} from 'inversify';
import {Controller, Get, Param} from 'routing-controllers';
import {SAMPLETYPES} from '../../logic/dependencies/sampleTypes.js';
import {Company} from '../../logic/entities/company.js';
import {CompanyTransactions} from '../../logic/entities/companyTransactions.js';
import {ErrorCodes} from '../../logic/errors/errorCodes.js';
import {CompanyService} from '../../logic/services/companyService.js';
import {ErrorFactory} from '../../plumbing/errors/errorFactory.js';

/*
 * Our API controller runs after claims handling has completed
 */
@Controller('/companies')
export class CompanyController {

    private readonly service: CompanyService;

    public constructor(@inject(SAMPLETYPES.CompanyService) service: CompanyService) {
        this.service = service;
        this.setupCallbacks();
    }

    /*
     * Return a list of companies
     */
    @Get('')
    public async getCompanyList(): Promise<Company[]> {
        return this.service.getCompanyList();
    }

    /*
     * Return a composite object containing company transactions
     */
    @Get('/:id/transactions')
    public async getCompanyTransactions(@Param('id') id: string): Promise<CompanyTransactions> {

        // Parse the ID and throw a 400 error if it is invalid
        const companyId = parseInt(id, 10);
        if (isNaN(companyId) || companyId <= 0) {

            throw ErrorFactory.createClientError(
                400,
                ErrorCodes.invalidCompanyId,
                'The company id must be a positive numeric integer');
        }

        // Next authorize access based on claims
        return this.service.getCompanyTransactions(companyId);
    }

    /*
     * Plumbing to ensure the this parameter is available
     */
    private setupCallbacks(): void {
        this.getCompanyList = this.getCompanyList.bind(this);
        this.getCompanyTransactions = this.getCompanyTransactions.bind(this);
    }
}
