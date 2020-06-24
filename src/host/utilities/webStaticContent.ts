import express from 'express';
import path from 'path';

/*
 * Relative paths to web content, from other code samples in parallel folders to this one
 */
const WEB_FILES_ROOT = '../../../../authguidance.websample.final/spa';

/*
 * For demo purposes our API also hosts some web static content
 */
export class WebStaticContent {

    private readonly _expressApp: express.Application;

    public constructor(expressApp: express.Application) {
        this._expressApp = expressApp;
    }

    /*
     * When our SPA is run against a local API, the API serves static content from the SPA folder
     */
    public handleWebRequests(): void {

        // Handle the request for the configuration file specially
        this._expressApp.get('/spa/spa.config.json', this._webConfigResource);

        // The API serves static content from the SPA folder
        this._expressApp.get('/spa', this._webRootResource);
        this._expressApp.get('/spa/*', this._webResource);

        // Handle root requests for the favicon
        this._expressApp.get('/favicon.ico', this._faviconResource);
    }

    /*
     * Serve up the root web file
     */
    private _webRootResource(request: express.Request, response: express.Response): void {
        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/index.html`);
        response.sendFile(webFilePath);
    }

    /*
     * When the web configuration file is requested, we serve the local API version
     */
    private _webConfigResource(request: express.Request, response: express.Response): void {

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/spa.config.localapi.json`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up the requested web file
     */
    private _webResource(request: express.Request, response: express.Response): void {

        let resourcePath = request.path.replace('spa/', '');
        if (resourcePath === '/') {
           resourcePath = 'index.html';
        }

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/${resourcePath}`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up our favicon
     */
    private _faviconResource(request: express.Request, response: express.Response): void {
        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/favicon.ico`);
        response.sendFile(webFilePath);
    }
}
