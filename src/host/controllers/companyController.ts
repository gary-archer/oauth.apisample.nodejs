import {Request, Response} from 'express';
import {inject} from 'inversify';
import {SAMPLETYPES} from '../../logic/dependencies/sampleTypes.js';
import {ErrorCodes} from '../../logic/errors/errorCodes.js';
import {CompanyService} from '../../logic/services/companyService.js';
import {ErrorFactory} from '../../plumbing/errors/errorFactory.js';
import {ResponseWriter} from '../../plumbing/utilities/responseWriter.js';

/*
 * Our API controller runs after claims handling has completed
 */
export class CompanyController {

    private readonly service: CompanyService;

    public constructor(@inject(SAMPLETYPES.CompanyService) service: CompanyService) {
        this.service = service;
        this.setupCallbacks();
    }

    /*
     * Return a list of companies
     */
    public async getCompanyList(request: Request, response: Response): Promise<void> {

        const result = this.service.getCompanyList();
        ResponseWriter.writeSuccessResponse(response, 200, result);
    }

    /*
     * Return a composite object containing company transactions
     */
    public async getCompanyTransactions(request: Request, response: Response): Promise<void> {

        // Parse the ID and throw a 400 error if it is invalid
        const companyId = parseInt(request.params.id, 10);
        if (isNaN(companyId) || companyId <= 0) {

            throw ErrorFactory.createClientError(
                400,
                ErrorCodes.invalidCompanyId,
                'The company id must be a positive numeric integer');
        }

        // Next authorize access based on claims
        const result = this.service.getCompanyTransactions(companyId);
        ResponseWriter.writeSuccessResponse(response, 200, result);
    }

    /*
     * Plumbing to ensure the this parameter is available
     */
    private setupCallbacks(): void {
        this.getCompanyList = this.getCompanyList.bind(this);
        this.getCompanyTransactions = this.getCompanyTransactions.bind(this);
    }
}
