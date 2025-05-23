import {RouteDefinition} from './routeDefinition.js';

/*
 * This API uses only the GET method though other methods could be added in a similar way
 */
export function Get(path: string) {

    return (target: any, propertyKey: string): void => {

        if (!Reflect.hasMetadata('routes', target.constructor)) {
            Reflect.defineMetadata('routes', [], target.constructor);
        }

        const routes = Reflect.getMetadata('routes', target.constructor) as Array<RouteDefinition>;
        routes.push({
            method: 'get',
            path,
            methodName: propertyKey,
        });

        Reflect.defineMetadata('routes', routes, target.constructor);
    };
}
