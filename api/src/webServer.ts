import {Router, Request, Response} from 'express';
import * as path from 'path';
const WebFilesRoot = '../../';

/*
 * A primitive web server for our simple web content
 */
export default class WebServer {

    /*
     * Fields
     */
    private _expressApp: Router;

    /*
     * Class setup
     */
    public constructor(expressApp: Router) {
        this._expressApp = expressApp;
    }

    /*
     * Set up Web API listening
     */
    public configureRoutes(): void {

        this._expressApp.get('/spa/*', this._getWebResource);
        this._expressApp.get('/spa', this._getWebRootResource);
        this._expressApp.get('/favicon.ico', this._getFavicon);
    }

    /*
     * Serve up the requested web file
     */
    private _getWebResource(request: Request, response: Response): void {

        let resourcePath = request.path.replace('spa/', '');
        if (resourcePath === '/') {
           resourcePath = 'index.html';
        }
        
        let webFilePath = path.join(`${__dirname}/${WebFilesRoot}/spa/${resourcePath}`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up the requested web file
     */
    private _getWebRootResource(request: Request, response: Response): void {
        
        let webFilePath = path.join(`${__dirname}/${WebFilesRoot}/spa/index.html`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up our favicon
     */
    private _getFavicon(request: Request, response: Response): void {
        
        let webFilePath = path.join(`${__dirname}/${WebFilesRoot}/spa/favicon.ico`);
        response.sendFile(webFilePath);
    }
}