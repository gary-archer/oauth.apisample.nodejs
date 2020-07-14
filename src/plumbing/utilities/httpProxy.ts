import TunnelAgent from 'tunnel-agent';
import url from 'url';

/*
 * Some HTTP libraries require an agent to be expressed in order to see traffic in Fiddler or Charles
 */
export class HttpProxy {

    /*
     * Create the agent if there is a proxy environment variable
     */
    public static initialize(useProxy: boolean, proxyUrl: string): void {

        if (useProxy) {
            const opts = url.parse(proxyUrl);
            HttpProxy._agent = TunnelAgent.httpsOverHttp({
                proxy: opts,
            });
        }
    }

    /*
     * Return the configured agent
     */
    public static get(): any {
        return HttpProxy._agent;
    }

    // The global agent instance
    private static _agent: any;
}
