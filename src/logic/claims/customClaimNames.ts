/*
 * Constants for custom claim names
 */
export class CustomClaimNames {

    // These claims are stored in the identity data and received in access tokens
    public static readonly managerId = 'manager_id';
    public static readonly role = 'role';

    // These claims are stored in business data and looked up when an access token is first received
    public static readonly title = 'title';
    public static readonly regions = 'regions';
}
