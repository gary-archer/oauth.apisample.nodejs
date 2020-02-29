import express from 'express';
import path from 'path';

/*
 * Relative paths to web content, from other code samples in parallel folders to this one
 */
const WEB_FILES_ROOT = '../../../../authguidance.websample.final/spa';
const LOOPBACK_FILES_ROOT = '../../../../authguidance.desktopsample1/web';
const DESKTOP_FILES_ROOT = '../../../../authguidance.desktopsample.final/web';
const MOBILE_FILES_ROOT = '../../../../authguidance.mobilesample.android';

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
     * The post login page for our initial desktop app, which uses loopback logins
     */
    public handleDesktopLoopbackRequests(): void {

        this._expressApp.get('/loopback/postlogin.html', this._loopbackPostLoginPage);
    }

    /*
     * When our desktop private URI scheme sample is run against a local API, serve post login web content
     */
    public handleDesktopRequests(): void {

        this._expressApp.get('/desktop/postlogin.html', this._desktopPostLoginPage);
        this._expressApp.get('/desktop/postLogout.html', this._desktopPostLogoutPage);
    }

    /*
     * When our Android app is run against a local API, serve mobile web content
     */
    public handleAndroidRequests(): void {

        this._expressApp.get('/mobile/postlogin.html', this._androidPostLoginPage);
        this._expressApp.get('/mobile/postlogout.html', this._androidPostLogoutPage);
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

    /*
     * Serve up the loopback post login page
     */
    private _loopbackPostLoginPage(request: express.Request, response: express.Response): void {

        const webFilePath = path.join(`${__dirname}/${LOOPBACK_FILES_ROOT}/postlogin.html`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up the desktop post login page
     */
    private _desktopPostLoginPage(request: express.Request, response: express.Response): void {
        const webFilePath = path.join(`${__dirname}/${DESKTOP_FILES_ROOT}/postlogin.html`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up the desktop post logout page
     */
    private _desktopPostLogoutPage(request: express.Request, response: express.Response): void {
        const webFilePath = path.join(`${__dirname}/${DESKTOP_FILES_ROOT}/postlogout.html`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up the Android post login page
     */
    private _androidPostLoginPage(request: express.Request, response: express.Response): void {
        const webFilePath = path.join(`${__dirname}/${MOBILE_FILES_ROOT}/web/postLogin.html`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up the Android post logout page
     */
    private _androidPostLogoutPage(request: express.Request, response: express.Response): void {
        const webFilePath = path.join(`${__dirname}/${MOBILE_FILES_ROOT}/web/postLogout.html`);
        response.sendFile(webFilePath);
    }
}
