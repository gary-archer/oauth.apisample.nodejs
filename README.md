# authguidance.websample.nodeapi

### Overview

* The final API and SPA sample using OAuth 2.0 and Open Id Connect, referenced in my blog at https://authguidance.com
* **This sample completes our SPA and implements our [API Platform Architecture](https://authguidance.com/2019/03/24/api-platform-design/) in NodeJS**

### Details

* See the [Final NodeJS API Sample Write Up](http://authguidance.com/2017/10/27/final-spa-overview/) for an overview and how to run the code

### Programming Languages

* TypeScript is used for the SPA
* NodeJS with TypeScript is used for the API

### Middleware Used

* The [Oidc-Client Library](https://github.com/IdentityModel/oidc-client-js) is used to implement the Implicit Flow
* The [OpenId-Client Library](https://github.com/panva/node-openid-client) is used to handle API token validation
* The [Node Cache](https://github.com/mpneuried/nodecache) is used to cache API claims keyed against tokens
* Express is used to host both the API and the SPA content
* [Inversify](http://inversify.io) is used to enable a more productive and portable API coding model
* Okta is used for the Authorization Server
* OpenSSL is used for SSL certificate handling
