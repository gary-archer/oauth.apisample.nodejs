import * as icoList from '../../data/icoList.json';
import * as allTransactions from '../../data/icoTransactions.json';

/*
 * A simple API controller for getting data about Initial Coin Offerings and their transactions
 */
export default class IcoRepository {

    /*
     * Return the list of ICOs
     */
    public getList(): any {
        return icoList;
    }
    
    /*
     * Return transactions for an ICO given its contract address
     */
    public getDetails(contract_address: string): any {

        let foundIco = icoList.icos.find((i:any) => i.contract_address === contract_address);
        if (foundIco) {

            let foundIcoTransactions = allTransactions.icos.find((t:any) => t.contract_address === contract_address);
            if (foundIcoTransactions) {
                foundIco.transactions = foundIcoTransactions.transactions;
            }
        }

        return foundIco;
    }
}