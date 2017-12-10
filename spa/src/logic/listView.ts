import Authenticator from '../plumbing/authenticator';
import HttpClient from '../plumbing/httpClient';
import * as $ from 'jquery';

/*
 * Logic related to the list view
 */
export default class ListView {
    
    /*
     * Fields
     */
    private _authenticator: Authenticator;
    private _apiBaseUrl: string;
    
    /*
     * Class setup
     */
    public constructor(authenticator: Authenticator, apiBaseUrl: string) {
        this._authenticator = authenticator;
        this._apiBaseUrl = apiBaseUrl;
        this._setupCallbacks();
    }
    
    /*
     * Run the view
     */
    public async execute(): Promise<void> {
        
        // Set UI content while loading
        $('#listContainer').removeClass('hide');
        $('#listContainer').text('Calling API to get golfers list ...');

        // Get data and render it
        let data = await HttpClient.callApi(`${this._apiBaseUrl}/golfers`, 'GET', null, this._authenticator);
        this._renderData(data);
    }

    /*
     * Hide UI elements when the view unloads
     */
    public unload(): void {
        $('#listContainer').addClass('hide');
    }
    
    /*
     * Render data
     */
    private _renderData(data: any): void {

        // Clear loading content
        $('#listContainer').text('');
        
        // Set button state
        $('.initiallyDisabled').prop('disabled', false);
        $('.initiallyDisabled').removeClass('disabled');
        
        data.golfers.forEach((golfer:any) => {

            // Set up the image and a click handler
            let golferLink = $(`<a href='#' class='img-thumbnail'>
                                  <img class='golferImage' src='images/${golfer.name}_tn.png' class='img-responsive' data-id='${golfer.id}'>
                                </a>`);
            
            // Set text properties
            let golferDiv = $(`<div class='col-xs-3'>
                                 <div>Name : <b>${golfer.name}</b></div>
                                 <div>Tour Wins : <b>${golfer.tour_wins}</b></div>
                               </div>`);
            
            // Update the DOM
            golferDiv.append(golferLink);
            $('#listContainer').append(golferDiv);
        });

        // Add event handlers for image clicks
        $('.golferImage').on('click', this._selectGolferDetails);
    }
    
    /*
     * When a thumbnail is clicked we will request details data and then update the view
     */
    private _selectGolferDetails(e: any): void {
        let golferId = $(e.target).attr('data-id');
        location.hash = `#golfer=${golferId}`;
        e.preventDefault();
    }
    
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._renderData = this._renderData.bind(this);
        this._selectGolferDetails = this._selectGolferDetails.bind(this);
   }
}