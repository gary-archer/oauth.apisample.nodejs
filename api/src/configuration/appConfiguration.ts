/*
 * A holder for application settings
 */
export interface AppConfiguration {
    trustedOrigins: string[];
    sslCertificateFileName: string;
    sslCertificatePassword: string;
}
