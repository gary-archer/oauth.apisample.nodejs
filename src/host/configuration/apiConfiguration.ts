/*
 * A holder for API specific configuration settings
 */
export interface ApiConfiguration {

    port: number;

    sslCertificateFileName: string;

    sslCertificatePassword: string;

    useProxy: boolean;

    proxyUrl: string;
}
