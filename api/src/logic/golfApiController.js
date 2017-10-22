'use strict';
const dataRoot = '../../data'
const summaryData = require(`${dataRoot}/golfers.json`);
const detailsData = require(`${dataRoot}/golferTourWins.json`);

/*
 * An API controller for golf operations
 */
class GolfApiController {

    /*
     * Receive the request and response
     */
    constructor(request, response) {
        this.request = request;
        this.response = response;
    }
    
    /*
     * Return summary data for our golfer entities
     */
    getList() {
        
        this.response.end(JSON.stringify(summaryData));
    }
    
    /*
     * Return details for a golfer entity by id
     */
    getDetails(id) {

        // Find the golfer by id
        let foundGolfer = summaryData.golfers.find(g => g.id === id);
        if (!foundGolfer) {
            
            // Report errors
            this.response.status(404).send(`The golfer with id ${id} was not found`);
        }
        else {
            
            let foundGolferDetails = detailsData.golfers.find(g => g.id === id);
            foundGolfer.wins = foundGolferDetails.wins;
            this.response.end(JSON.stringify(foundGolfer));
        }
    }
}

module.exports = GolfApiController;