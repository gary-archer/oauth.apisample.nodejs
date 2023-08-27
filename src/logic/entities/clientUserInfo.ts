/*
 * Return user attributes that are not stored in the authorization server that the UI needs
 */
export interface ClientUserInfo {
    title: string;
    regions: string[];
}
