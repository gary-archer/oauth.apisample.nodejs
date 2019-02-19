import {inject, injectable} from 'inversify';
import {BasicApiClaims} from '../entities/basicApiClaims';
import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';
import {ClientError} from '../framework/errors/clientError';
import {BasicApiClaimsFactory} from '../utilities/basicApiClaimsFactory';
import {JsonFileReader} from '../utilities/jsonFileReader';

/*
 * A simple API controller for getting data about a company and its investments
 */
@injectable()
export class CompanyRepository {

    /*
     * Every API request receives our complex claims which are only calculated when the token is first received
     */
    private _claims: BasicApiClaims;
    private _jsonReader: JsonFileReader;

    /*
     * Receive claims when constructed
     */
    public constructor(
        @inject('JsonFileReader') jsonReader: JsonFileReader,
        @inject('BasicApiClaimsFactory') claimsFactory: BasicApiClaimsFactory) {

        this._claims = claimsFactory.getClaims();
        this._jsonReader = jsonReader;
    }

    /*
     * Return the list of companies from a hard coded data file
     */
    public async getCompanyList(): Promise<Company[]> {

        // Read data from a JSON file into objects
        const companies = await this._jsonReader.readData<Company[]>('data/companyList.json');

        // We will then filter on only authorized companies
        const authorizedCompanies = companies.filter((c) => this._isUserAuthorizedForCompany(c.id));
        return authorizedCompanies;
    }

    /*
     * Return transactions for a company given its id
     */
    public async getCompanyTransactions(id: number): Promise<CompanyTransactions> {

        // If the user is unauthorized we return 404
        if (!this._isUserAuthorizedForCompany(id)) {
           throw this._unauthorizedError(id);
        }

        // Read companies and find that supplied
        const companyList = await this._jsonReader.readData<Company[]>('data/companyList.json');
        const foundCompany = companyList.find((c) => c.id === id);
        if (foundCompany) {

            // Next read transactions from the database
            const companyTransactions =
                await this._jsonReader.readData<CompanyTransactions[]>('data/companyTransactions2.json');

            // Then join the data
            const foundTransactions = companyTransactions.find((ct) => ct.id === id);
            if (foundTransactions) {
                foundTransactions.company = foundCompany;
                return foundTransactions;
            }
        }

        // If the data is not found we also return 404
        throw this._unauthorizedError(id);
    }

    /*
     * Apply claims that were read when the access token was first validated
     */
    private _isUserAuthorizedForCompany(companyId: number): boolean {

        const found = this._claims.accountsCovered.find((c) => c === companyId);
        return !!found;
    }

    /*
     * Return a 404 error if the user is not authorized
     * Requests for both unauthorized and non existent data are treated the same
     */
    private _unauthorizedError(companyId: number): ClientError {
        return new ClientError(
            404,
            'company_not_found',
            `Company ${companyId} was not found for this user`);
    }
}
