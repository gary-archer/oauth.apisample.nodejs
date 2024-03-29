import {inject, injectable} from 'inversify';
import {ClaimsPrincipal} from '../../plumbing/claims/claimsPrincipal.js';
import {ClaimsReader} from '../../plumbing/claims/claimsReader.js';
import {BASETYPES} from '../../plumbing/dependencies/baseTypes.js';
import {ClientError} from '../../plumbing/errors/clientError.js';
import {ErrorFactory} from '../../plumbing/errors/errorFactory.js';
import {CustomClaimNames} from '../claims/customClaimNames.js';
import {SampleExtraClaims} from '../claims/sampleExtraClaims.js';
import {SAMPLETYPES} from '../dependencies/sampleTypes.js';
import {Company} from '../entities/company.js';
import {CompanyTransactions} from '../entities/companyTransactions.js';
import {ErrorCodes} from '../errors/errorCodes.js';
import {CompanyRepository} from '../repositories/companyRepository.js';

/*
 * The service class applies business authorization
 */
@injectable()
export class CompanyService {

    private readonly _repository: CompanyRepository;
    private readonly _claims: ClaimsPrincipal;

    public constructor(
        @inject(SAMPLETYPES.CompanyRepository) repository: CompanyRepository,
        @inject(BASETYPES.ClaimsPrincipal) claims: ClaimsPrincipal) {

        this._repository = repository;
        this._claims = claims;
    }

    /*
     * Forward to the repository to get the company list
     */
    public async getCompanyList(): Promise<Company[]> {

        // Use a micro services approach of getting all data
        const companies = await this._repository.getCompanyList();

        // We will then filter on only authorized companies
        return companies.filter((c) => this._isUserAuthorizedForCompany(c));
    }

    /*
     * Forward to the repository to get the company transactions
     */
    public async getCompanyTransactions(companyId: number): Promise<CompanyTransactions> {

        // Use a micro services approach of getting all data
        const data = await this._repository.getCompanyTransactions(companyId);

        // If the user is unauthorized or data was not found then return 404
        if (!data || !this._isUserAuthorizedForCompany(data.company)) {
            throw this._unauthorizedError(companyId);
        }

        return data;
    }

    /*
     * A simple example of applying domain specific claims
     */
    private _isUserAuthorizedForCompany(company: Company): boolean {

        // The admin role is granted access to all resources
        const role = ClaimsReader.getStringClaim(this._claims.jwt, CustomClaimNames.role).toLowerCase();
        if (role === 'admin') {
            return true;
        }

        // Unknown roles are granted no access to resources
        if (role !== 'user') {
            return false;
        }

        // For the user role, authorize based on a business rule that links the user to regional data
        const extraClaims = this._claims.extra as SampleExtraClaims;
        const found = extraClaims.regions.find((c) => c === company.region);
        return !!found;
    }

    /*
     * Return a 404 error if the user is not authorized
     * Requests for both unauthorized and non existent data are treated the same
     */
    private _unauthorizedError(companyId: number): ClientError {

        throw ErrorFactory.createClientError(
            404,
            ErrorCodes.companyNotFound,
            `Company ${companyId} was not found for this user`);
    }
}
