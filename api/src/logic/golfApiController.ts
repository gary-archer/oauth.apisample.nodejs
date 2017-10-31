const dataRoot = '../../data'
const summaryData = require(`${dataRoot}/golfers.json`);
const detailsData = require(`${dataRoot}/golferTourWins.json`);

/*
 * An API controller for golf operations
 */
export default class GolfApiController {

    /*
     * Fields
     */
    private _request: any;
    private _response: any;

    /*
     * Receive the request and response
     */
    public constructor(request: any, response: any) {
        this._request = request;
        this._response = response;
    }
    
    /*
     * Return summary data for our golfer entities
     */
    public getList(): any {
        this._response.end(JSON.stringify(summaryData));
    }
    
    /*
     * Return details for a golfer entity by id
     */
    public getDetails(id: number) {

        // Find the golfer by id
        let foundGolfer = summaryData.golfers.find(g => g.id === id);
        if (!foundGolfer) {
            
            // Report errors
            this._response.status(404).send(`The golfer with id ${id} was not found`);
        }
        else {
            
            let foundGolferDetails = detailsData.golfers.find(g => g.id === id);
            foundGolfer.wins = foundGolferDetails.wins;
            this._response.end(JSON.stringify(foundGolfer));
        }
    }
}