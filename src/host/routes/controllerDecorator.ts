import {Router} from 'express';
// import {Container} from 'inversify';
import {RouteDefinition} from './routeDefinition.js';

export const router = Router();

export const Controller = (prefix: string): ClassDecorator => {

    console.log('here1');
    return (target: any) => {

        console.log('here');

        Reflect.defineMetadata('prefix', prefix, target);
        if (!Reflect.hasMetadata('routes', target)) {
            Reflect.defineMetadata('routes', [], target);
        }

        const routes: Array<RouteDefinition> = Reflect.getMetadata('routes', target);

        // const instance: any = Container.get(target);

        routes.forEach((route: RouteDefinition) => {
            console.log('Registered route');
            router[route.method](`${prefix}${route.path}`, () => console.log('whatevar'));
        });
    };
};
