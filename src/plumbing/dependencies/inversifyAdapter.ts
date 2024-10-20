import {Action, ClassConstructor, IocAdapter} from 'routing-controllers';
import {Container} from 'inversify';

export class InversifyAdapter implements IocAdapter {

    private readonly container: Container;

    constructor(container: Container) {
        this.container = container;
    }

    public get<T>(someClass: ClassConstructor<T>, action?: Action): T {

        const childContainer = action?.response.locals.container as Container;
        return childContainer?.resolve<T>(someClass);
    }
}