# authguidance.apisample.node

### Overview

* The final API code sample using OAuth 2.0 and Open Id Connect, referenced in my blog at https://authguidance.com
* This sample's focus is on supportability and reducing the cost of implementing a new API via frameworks

### Details

* See the [Final SPA and API Write Up](https://authguidance.com/2017/10/27/api-architecture-node) for an overview and how to run the code

### Programming Languages

* NodeJS with TypeScript is used for the API

### Middleware Used

* The [OpenId-Client Library](https://github.com/panva/node-openid-client) is used to handle API token validation
* The [Node Cache](https://github.com/mpneuried/nodecache) is used to cache API claims keyed against tokens
* Express is used to host the API
* [Inversify](http://inversify.io) is used to enable a more productive and portable API coding model
* Okta is used for the Authorization Server
* OpenSSL is used for SSL certificate handling