/*
 * A holder for API specific configuration settings
 */
export interface ApiConfiguration {

    // CORS origins used for SPA requests
    trustedOrigins: string[];

    // The path to the SSL certificate PEM file
    sslCertificateFileName: string;

    // The SSL certificate's private key password
    sslCertificatePassword: string;

    // Whether to use an HTTPS proxy
    useProxy: boolean;

    // The proxy URL when used
    proxyUrl: string;
}
