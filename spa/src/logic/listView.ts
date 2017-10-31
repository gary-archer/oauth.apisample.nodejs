'use strict';
import HttpClient from '../plumbing/httpClient';
import * as $ from 'jquery';

/*
 * Logic related to the list view
 */
export default class ListView {
    
    /*
     * Fields
     */
    authenticator: any;
    baseUrl: string;
    
    /*
     * Class setup
     */
    constructor(authenticator: any, baseUrl: string) {
        this.authenticator = authenticator;
        this.baseUrl = baseUrl;
        this._setupCallbacks();
    }
    
    /*
     * Run the view
     */
    execute(): any {
        
        // Set UI content while loading
        $('#listContainer').removeClass('hide');
        $('#listContainer').text('Calling API to get golfers list ...');

        // Do the work
        return HttpClient.callApi(`${this.baseUrl}/golfers`, 'GET', null, this.authenticator)
            .then(this._renderData);
    }

    /*
     * Hide UI elements when the view unloads
     */
    unload(): void {
        $('#listContainer').addClass('hide');
    }
    
    /*
     * Render data
     */
    _renderData(data: any): any {

        // Clear loading content
        $('#listContainer').text('');
        
        // Set button state
        $('.initiallyDisabled').prop('disabled', false);
        $('.initiallyDisabled').removeClass('disabled');
        
        data.golfers.forEach(golfer => {

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
        return Promise.resolve();
    }
    
    /*
     * When a thumbnail is clicked we will request details data and then update the view
     */
    _selectGolferDetails(e: any): void {
        let golferId = $(e.target).attr('data-id');
        location.hash = `#golfer=${golferId}`;
        e.preventDefault();
    }
    
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    _setupCallbacks(): void {
        this._renderData = this._renderData.bind(this);
        this._selectGolferDetails = this._selectGolferDetails.bind(this);
   }
}