# authguidance.apisample.nodejs

### Overview

* The final API code sample using OAuth 2.0 and Open Id Connect, referenced in my blog at https://authguidance.com
* **The goal of this sample is to implement our [API Platform Architecture](https://authguidance.com/2019/03/24/api-platform-design/) in NodeJS**

### Details

* See the [Overview Page](https://authguidance.com/2017/10/27/api-architecture-node) for what the API does and how to run it
* See the [Coding Key Points]() for technical implementation details

### Programming Languages

* NodeJS with TypeScript is used for the API

### Middleware Used

* The [OpenId-Client Library](https://github.com/panva/node-openid-client) is used for API OAuth operations
* The [Node Cache](https://github.com/mpneuried/nodecache) is used to cache API claims in memory
* Express is used to host the API
* [Inversify](http://inversify.io) is used to enable a more productive and portable API coding model
* Okta is used for the Authorization Server
* OpenSSL is used for SSL certificate handling
