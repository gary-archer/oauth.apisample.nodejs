# Final OAuth Node.js API

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/4e685ae1d0ae4d3091e0dccd5b3cd011)](https://www.codacy.com/gh/gary-archer/oauth.apisample.nodejs/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gary-archer/oauth.apisample.nodejs&amp;utm_campaign=Badge_Grade) 

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.apisample.nodejs/badge.svg?targetFile=package.json)](https://snyk.io/test/github/gary-archer/oauth.apisample.nodejs?targetFile=package.json)

## Overview

The final OAuth secured Node.js API code sample, referenced in my blog at https://authguidance.com:

- The API takes finer control over OAuth domain specific claims and uses a certified JOSE library
- The API also implements other [Non Functional Behaviour](https://authguidance.com/2017/10/08/corporate-code-sample-core-behavior/), for good technical quality

## Build the API

Run the following script to build the API and start listening over HTTPS.\
You need to run the script at least once in order to download development SSL certificates.

```bash
./start.sh
```

## Integration Test Setup

Wiremock is used to mock the Authorization Server, which requires a Java runtime to be installed as a prerequisite.\
Also add host names for the API and Authorization Server to your hosts file:

```text
127.0.0.1     localhost api.authsamples-dev.com login.mycompany.com
::1           localhost
```

## Run Integration Tests

To test the API's endpoints, stop the API if it is running, then run integration tests:

```bash
npm test
```

The API then runs some integration tests to demonstrate key API behaviour:

```text
Running Wiremock and API ...
Waiting for Wiremock endpoints to come up ...
Waiting for API endpoints to come up ...
Running integration tests ...


  OAuth API Tests
    ✔ Get user claims returns a single region for the standard user
    ✔ Get user claims returns all regions for the admin user
    ✔ Get companies list returns 2 items for the standard user
    ✔ Get companies list returns all items for the admin user
    ✔ Get transactions is allowed for companies that match the regions claim
    ✔ Get transactions returns 404 for companies that do not match the regions claim
    ✔ API exceptions return 500 with a supportable error response
```

## Run a Basic Load Test

To run a basic load test, stop the API and Wiremock if running, then run the load test:

```bash
npm run loadtest
```

This sends parallel requests to the API to verify that the code has no concurrency problems.\
The API then reports metrics to enable early visualization of errors and slowness:

```text
OPERATION                START-TIME                  MILLISECONDS-TAKEN   STATUS-CODE   ERROR-CODE              ERROR-ID    
getUserInfoClaims        2022-04-10T19:02:48.126Z    25                   200                                               
getCompanyList           2022-04-10T19:02:48.130Z    22                   200                                               
getCompanyList           2022-04-10T19:02:48.131Z    22                   200                                               
getCompanyTransactions   2022-04-10T19:02:48.129Z    24                   200                                               
getCompanyTransactions   2022-04-10T19:02:48.129Z    25                   200                                               
getUserInfoClaims        2022-04-10T19:02:48.154Z    13                   200                                               
getCompanyList           2022-04-10T19:02:48.158Z    12                   200                                               
getCompanyList           2022-04-10T19:02:48.157Z    13                   200                                               
getCompanyTransactions   2022-04-10T19:02:48.156Z    15                   200                                               
getCompanyTransactions   2022-04-10T19:02:48.155Z    16                   200                                               
getCompanyList           2022-04-10T19:02:48.174Z    11                   500           exception_simulation    79162       
getUserInfoClaims        2022-04-10T19:02:48.172Z    14                   401           unauthorized                        
getCompanyList           2022-04-10T19:02:48.175Z    12                   200                                               
getCompanyTransactions   2022-04-10T19:02:48.173Z    14                   200                                         
```

## Further Details

* See the [Overview Page](https://authguidance.com/2017/10/27/api-architecture-node) for further details on running the API
* See the [Coding Key Points Page](https://authguidance.com/2017/10/27/final-nodeapi-coding-key-points/) for key implementation details

## Programming Languages

* Node.js with TypeScript is used to implement the REST API

## Middleware Used

* Express is used to host the API over SSL port 443
* AWS Cognito is used as the default Authorization Server
* The [JOSE Library](https://github.com/panva/jose) is used to manage in memory validation of JWTs
* [Inversify](http://inversify.io) is used to manage dependencies in line with other development languages
* API logs can be aggregated to [Elasticsearch](https://authguidance.com/2019/07/19/log-aggregation-setup/) to support [Query Use Cases](https://authguidance.com/2019/08/02/intelligent-api-platform-analysis/)
