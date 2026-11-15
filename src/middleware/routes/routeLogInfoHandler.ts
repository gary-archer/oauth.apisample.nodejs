import {Request} from 'express';
import {RouteLogInfo} from './routeLogInfo.js';
import {RouteMetadata} from './routeMetadata.js';

/*
 * A helper class to capture logging data
 */
export class RouteLogInfoHandler {

    private readonly routes: RouteMetadata[];

    public constructor(routes: RouteMetadata[]) {
        this.routes = routes;

    }

    public getLogInfo(request: Request) : RouteLogInfo | null {

        // Get the request path, such as '/investments/companies/2/transactions' without the query string
        const requestPath = (request.baseUrl + request.path).replace(/\/+$/, '');

        // Find the match in the routes and return log information
        for (const route of this.routes) {

            const logInfo = this.getMatchingRouteLogInfo(request.method, requestPath, route);
            if (logInfo) {
                return logInfo;
            }
        }

        return null;
    }

    /*
     * If a route's method and path matches, return information to log
     */
    private getMatchingRouteLogInfo(
        requestMethod: string,
        requestPath: string,
        route: RouteMetadata): RouteLogInfo | null {

        // First check that the HTTP method matches
        if (route.method.toLowerCase() !== requestMethod.toLowerCase()) {
            return null;
        }

        // Split paths into parts
        const routeParts = route.path.split('/');
        const requestParts = requestPath.split('/');
        if (routeParts.length !== requestParts.length) {
            return null;
        }

        // Check for a match in the route path and the request path, as in these examples:
        // - /investments/companies/:id/transactions
        // - /investments/companies/2/transactions
        const segments = requestParts.length;
        const resourceIds = [];
        for (let segment = 0; segment < segments; segment++) {

            // Consider REST template parameters to be a match
            if (routeParts[segment].startsWith(':')) {

                // Add to resource ids
                resourceIds.push(requestParts[segment]);

            } else {

                // For non template parameters require an exact match
                if (routeParts[segment] !== requestParts[segment]) {
                    return null;
                }
            }
        }

        // Get a name like getCompanyList from the string callback representation like 'c=>c.getCompanyList'
        const operationNameParts = route.action.toString().split('.');
        const operationName = operationNameParts.length > 1 ? operationNameParts[1] : '';

        return {
            operationName,
            resourceIds,
        };
    }
}
