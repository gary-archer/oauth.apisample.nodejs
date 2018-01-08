import Authenticator from '../plumbing/authenticator';
import HttpClient from '../plumbing/httpClient';
import * as $ from 'jquery';

/*
 * Logic related to the list view
 */
export default class DetailsView {
    
    /*
     * Fields
     */
    private _authenticator: Authenticator;
    private _apiBaseUrl: string;
    private _contract_address: string;
    
    /*
     * Class setup
     */
    public constructor(authenticator: any, apiBaseUrl: string, contract_address: string) {
        this._authenticator = authenticator;
        this._apiBaseUrl = apiBaseUrl;
        this._contract_address = contract_address;
        this._setupCallbacks();
    }
    
    /*
     * Run the view
     */
    public async execute(): Promise<void> {

        // Set UI content while loading
        $('.transactionscontainer').removeClass('hide');
        
        try {
            // Get data and render it
            let url = `${this._apiBaseUrl}/icos/${this._contract_address}`;
            let data = await HttpClient.callApi(url, 'GET', null, this._authenticator);
            return this._renderData(data);
        }
        catch (uiError) {
            // If an invalid id is typed in the browser then return to the list page
            if (uiError.statusCode === 404) {
                location.hash ='#';
             }

             throw uiError;
        }
    }

    /*
     * Hide UI elements when the view unloads
     */
    public unload(): void {
        $('.transactionscontainer').addClass('hide');
    }
    
    /*
     * Render data after receiving it from the API
     */
    private _renderData(ico: any): void {

        $('.transactionslist').text('');
        $('#tokenHeader').text(`Transactions for ${ico.token_name}`);
        $('#contractAddress').text(`${ico.contract_address}`);
        
        ico.transactions.forEach((transaction:any) => {

            // Format fields for display
            let amountUsd = transaction.amount_usd.toFixed(6);
            let amountEth = transaction.amount_eth.toFixed(6);

            // Render the UI
            let transactionDiv = $(`<div class='item col-xs-6'>
                                      <div class='thumbnail'>
                                        <div class='caption row text-left'>
                                          <div class='col-xs-2'><h4>TxHash</h4></div>
                                          <div class='col-xs-10 hash'><h4>${transaction.tx_hash}</h4></div>  
                                        </div>
                                        <div class='caption row text-left'>
                                          <div class='col-xs-2 left-align'>From</div>
                                          <div class='col-xs-10'>
                                            <span class='account'>${transaction.from}</span>
                                          </div>
                                        </div>
                                        <div class='caption row text-left'>
                                          <div class='col-xs-2'>To</div>
                                          <div class='col-xs-10'>
                                            <span class='account'>${transaction.to}</span>
                                          </div>
                                        </div>
                                        <div class='caption row text-left amount'>
                                          <div class='col-xs-2'>USD</div>
                                          <div class='col-xs-10'>${amountUsd}</div>
                                        </div>
                                        <div class='caption row text-left amount'>
                                          <div class='col-xs-2'>ETH</div>
                                          <div class='col-xs-10'>${amountEth}</div>
                                        </div>
                                      </div>
                                    </div>`);

            // Update the DOM
            $('.transactionslist').append(transactionDiv);
        });
    }
    
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._renderData = this._renderData.bind(this);
   }
}