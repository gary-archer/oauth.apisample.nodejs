'use strict';
import HttpClient from 'httpClient';
import $ from 'jquery';

/*
 * Logic related to the list view
 */
export default class DetailsView {
    
    /*
     * Class setup
     */
    constructor(authenticator, baseUrl, id) {
        this.authenticator = authenticator;
        this.baseUrl = baseUrl;
        this.id = id;
        this._setupCallbacks();
    }
    
    /*
     * Run the view
     */
    execute() {

        // Set UI content while loading
        $('#detailsContainer').removeClass('hide');
        $('#detailsContainer').text('Calling API to get golfer details ...');
        
        // Call the API
        let url = `${this.baseUrl}/golfers/${this.id}`;
        return HttpClient.callApi(url, 'GET', null, this.authenticator)
            .then(data => {
                
                // Render results
                return this._renderData(data);
            })
            .catch(uiError => {
                
                // If an invalid id is typed in the browser then return to the list page
                if (uiError.statusCode === 404) {
                   location.hash ='#';
                   return Promise.resolve();
                }
            
                // Otherwise propagate the error
                return Promise.reject(uiError);
            });
    }

    /*
     * Hide UI elements when the view unloads
     */
    unload() {
        $('#detailsContainer').addClass('hide');
    }
    
    /*
     * Render data
     */
    _renderData(golfer) {

        // Clear loading content
        $('#detailsContainer').text('');
        
        // Set button state
        $('.initiallyDisabled').prop('disabled', false);
        $('.initiallyDisabled').removeClass('disabled');

        // Use the full size image
        let golferImage = $(`<a>
                               <img src='images/${golfer.name}.png' class='img-responsive'>
                             </a>`);
            
        // Render summary details
        let golferDiv = $(`<div class='col-xs-6'>
                             <div>Name : <b>${golfer.name}</b></div>
                             <div>Tour Wins : <b>${golfer.tour_wins}</b></div>
                           </div>`);
        golferDiv.append(golferImage);
        $('#detailsContainer').append(golferDiv);
        
        // Render the tour wins container
        let tourWinsDiv = $(`<div class='col-xs-6'>
                               <div><b>All Tour Wins</b></div>
                               <ul id='wins_list'></ul>
                             </div>`);
        $('#detailsContainer').append(tourWinsDiv);
        
        // Render individual win details
        golfer.wins.forEach(win => {
            let info = `${win.year} : ${win.eventName}`;
            $('#wins_list').append($('<li>').html(info));
        });

        return Promise.resolve();
    }
    
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    _setupCallbacks() {
        this._renderData = this._renderData.bind(this);
   }
}