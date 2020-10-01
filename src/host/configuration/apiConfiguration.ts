/*
 * A holder for API specific configuration settings
 */
export interface ApiConfiguration {

    // The path to the SSL certificate PEM file
    sslCertificateFileName: string;

    // The SSL certificate's private key password
    sslCertificatePassword: string;

    // The SSL port to listen on
    sslPort: number;

    // Whether to use an HTTPS proxy
    useProxy: boolean;

    // The proxy URL when used
    proxyUrl: string;

    // We allow CORS requests from SPAs from these origins
    webTrustedOrigins: string[];
}
