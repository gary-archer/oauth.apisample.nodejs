import {ApiLogger} from '../utilities/apiLogger';
import {ApiError} from './apiError';
import {BaseErrorHandler} from './baseErrorHandler';
import {ClientError} from './clientError';

/*
 * A class to handle composing and reporting errors
 */
export class OAuthErrorHandler extends BaseErrorHandler {

    /*
     * Handle the request promise error for metadata lookup failures
     */
    public fromMetadataError(responseError: any, url: string): ApiError {

        // TODO: Intermittent RequestError due to Okta alt certificate names not reported correctly
        const apiError = new ApiError('metadata_lookup_failure', 'Metadata lookup failed');
        this._updateErrorFromHttpResponse(apiError, url, responseError);
        return apiError;
    }

    /*
     * Handle the request promise error for introspection failures
     */
    public fromIntrospectionError(responseError: any, url: string): ApiError {

        // Avoid reprocessing
        if (responseError instanceof ApiError) {
            return responseError;
        }

        const apiError = new ApiError('introspection_failure', 'Token validation failed');
        this._updateErrorFromHttpResponse(apiError, url, responseError);
        return apiError;
    }

    /*
     * Handle user info lookup failures
     */
    public fromUserInfoError(responseError: any, url: string): ApiError {

        // Avoid reprocessing
        if (responseError instanceof ApiError) {
            return responseError;
        }

        const apiError = new ApiError('userinfo_failure', 'User info lookup failed');
        this._updateErrorFromHttpResponse(apiError, url, responseError);
        return apiError;
    }

    /*
     * The error thrown if we cannot find an expected claim during OAuth processing
     */
    public fromMissingClaim(claimName: string): ApiError {

        const apiError = new ApiError('claims_failure', 'Authorization Data Not Found');
        apiError.details = `An empty value was found for the expected claim ${claimName}`;
        return apiError;
    }

    /*
     * Update error fields with OAuth response details
     */
    private _updateErrorFromHttpResponse(
        apiError: ApiError,
        url: string,
        responseError: any): void {

        if (responseError.error && responseError.error_description) {

            // Include OAuth error details if returned
            apiError.message += ` : ${responseError.error}`;
            apiError.details = responseError.error_description;
        } else {

            // Otherwise capture exception details
            apiError.details = this._getExceptionDetails(responseError);
        }

        // Include the URL in the error details
        apiError.details += `, URL: ${url}`;
    }
}
