import {Disposable} from '../utilities/disposable.js';

/*
 * A helper function similar to the .Net concept
 */
export async function using<T extends Disposable>(resource: T, func: () => any): Promise<any> {

    try {
        return await func();
    } finally {
        resource.dispose();
    }
}
