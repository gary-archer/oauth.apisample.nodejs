# Final OAuth Node.js API

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/4e685ae1d0ae4d3091e0dccd5b3cd011)](https://www.codacy.com/gh/gary-archer/oauth.apisample.nodejs/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gary-archer/oauth.apisample.nodejs&amp;utm_campaign=Badge_Grade) 

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.apisample.nodejs/badge.svg?targetFile=package.json)](https://snyk.io/test/github/gary-archer/oauth.apisample.nodejs?targetFile=package.json)

## Overview

The final OAuth secured Node.js API code sample, referenced in my blog at https://authguidance.com:

- The API takes finer control over OAuth domain specific claims and uses a certified JOSE library
- The API also implements other [Non Functional Behaviour](https://authguidance.com/2017/10/08/corporate-code-sample-core-behavior/), for good technical quality

## Build the API

Run the following script to build the API and start listening over HTTPS.\
Development SSL certificates must be downloaded before `npm start` will work.

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

Then run the following command, to run the API with a test configuration, along with Wiremock:

```bash
npm run testsetup
```

## Run Integration Tests

To test the API's endpoints, stop the API if it is running, then run integration tests:

```bash
npm test
```

The API then runs some integration tests to demonstrate key API behaviour:

```text
OAuth API Tests
  ✔ Get user claims returns a single region for the standard user
  ✔ Get user claims returns all regions for the admin user
  ✔ Get companies list returns 2 items for the standard user
  ✔ Get companies list returns all items for the admin user
  ✔ Get companies list with malicious JWT signing key returns a 401 error
  ✔ Get transactions is allowed for companies that match the regions claim
  ✔ Get transactions returns 404 for companies that do not match the regions claim
  ✔ API exceptions return 500 with a supportable error response
```

## Run a Basic Load Test

To run a basic load test, stop the API and Wiremock if running, then run this command:

```bash
npm run loadtest
```

This sends parallel requests to the API to verify that the code has no concurrency problems.\
The API then reports metrics to enable early visualization of errors and slowness:

```text
OPERATION                CORRELATION-ID                        START-TIME                  MILLISECONDS-TAKEN   STATUS-CODE   ERROR-CODE              ERROR-ID    
getUserInfoClaims        920387a0-4196-24af-acf3-55e61769da9e  2022-04-10T21:00:14.081Z    72                   200
getCompanyList           dec2dca9-0dbb-4bf0-c16b-50b8e515022c  2022-04-10T21:00:14.091Z    69                   200
getCompanyList           fae39ffe-4d9a-20e3-c240-f1b4ba069152  2022-04-10T21:00:14.093Z    68                   200
getCompanyTransactions   cfa99c2c-67e4-5353-6521-fa33c5a194ac  2022-04-10T21:00:14.087Z    75                   200
getCompanyTransactions   02379802-2680-22d3-23a6-b41086efdb71  2022-04-10T21:00:14.089Z    75                   200
getUserInfoClaims        7a42b19a-c028-f1bb-f57a-c9f94b911507  2022-04-10T21:00:14.164Z    38                   200
getCompanyList           66eb315f-f4a4-334f-63dc-fa7ff9628117  2022-04-10T21:00:14.173Z    40                   200
getCompanyList           69f5ffb8-6b9a-b806-1ccc-3a1607d56deb  2022-04-10T21:00:14.171Z    44                   200
getCompanyTransactions   0a93d119-5385-257f-c4f3-668ba5a0f6dd  2022-04-10T21:00:14.167Z    50                   200
getCompanyTransactions   65b2f261-056c-d0af-87aa-b4c25b65039a  2022-04-10T21:00:14.169Z    49                   200
getCompanyList           54c9bbe8-dcaa-bded-cacc-23ebd3b23cbc  2022-04-10T21:00:14.224Z    33                   500           exception_simulation    24398
getUserInfoClaims        8f4d1228-cad8-9d1a-72e0-0ccbbeefa663  2022-04-10T21:00:14.218Z    39                   401           unauthorized
getCompanyList           348d8dd6-e8ee-e811-553e-6815c58e6e80  2022-04-10T21:00:14.226Z    38                   200
getCompanyTransactions   65dc3711-d5ef-178b-2d2b-728a991a18e8  2022-04-10T21:00:14.222Z    43                   200
getCompanyTransactions   822ef51e-6219-de6e-3e13-909df036c49a  2022-04-10T21:00:14.220Z    46                   200
getUserInfoClaims        f244f6e0-5ccc-e1f7-8c1c-d15e3ae8ca06  2022-04-10T21:00:14.266Z    27                   200
getCompanyList           bc0c89c6-9e34-8284-060b-5fb5322aee95  2022-04-10T21:00:14.269Z    27                   200
getCompanyTransactions   26457ca5-7ca8-99fe-19f6-56dc4572d81f  2022-04-10T21:00:14.268Z    29                   200
getCompanyTransactions   14a60e83-5f0a-4dbd-ac26-5e1b0252b16d  2022-04-10T21:00:14.267Z    30                   200
getCompanyList           055c6711-59a6-e6b4-0369-5517fdab2cdb  2022-04-10T21:00:14.269Z    29                   200
getUserInfoClaims        ab5257a0-3a4a-e1b3-5b31-bfbf506edf75  2022-04-10T21:00:14.299Z    19                   200
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
