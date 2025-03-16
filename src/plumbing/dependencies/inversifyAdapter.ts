import {Action, ClassConstructor, IocAdapter} from 'routing-controllers';
import {Container} from 'inversify';

/*
 * Tell the routing controllers library to resolve objects with the child container for the current request
 */
export class InversifyAdapter implements IocAdapter {

    public get<T>(someClass: ClassConstructor<T>, action?: Action): T {

        const childContainer = action?.response.locals.container as Container;
        return childContainer?.get<T>(someClass, { autobind: true });
    }
}
