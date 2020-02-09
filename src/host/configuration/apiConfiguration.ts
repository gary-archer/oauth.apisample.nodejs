/*
 * A holder for API specific configuration settings
 */
export interface ApiConfiguration {
    trustedOrigins: string[];
    sslCertificateFileName: string;
    sslCertificatePassword: string;
    useProxy: boolean;
    proxyUrl: string;
}
