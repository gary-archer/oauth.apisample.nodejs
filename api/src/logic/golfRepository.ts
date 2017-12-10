import * as summaryData from '../../data/golfers.json';
import * as detailsData from '../../data/golferTourWins.json';

/*
 * An API controller for golf operations
 */
export default class GolfRepository {

    /*
     * Return summary data for our golfer entities
     */
    public getList(): any {
        return summaryData;
    }
    
    /*
     * Return details for a golfer entity by id
     */
    public getDetails(id: number): any {

        let foundGolfer = (<any>summaryData).golfers.find((g:any) => g.id === id);
        if (foundGolfer) {

            let foundGolferDetails = (<any>detailsData).golfers.find((g:any) => g.id === id);
            foundGolfer.wins = foundGolferDetails.wins;
        }

        return foundGolfer;
    }
}