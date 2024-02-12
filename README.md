# Final OAuth Node.js API

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/adc8714adb3446f3858f16e15c2118e0)](https://app.codacy.com/gh/gary-archer/oauth.apisample.nodejs?utm_source=github.com&utm_medium=referral&utm_content=gary-archer/oauth.apisample.nodejs&utm_campaign=Badge_Grade)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.apisample.nodejs/badge.svg?targetFile=package.json)](https://snyk.io/test/github/gary-archer/oauth.apisample.nodejs?targetFile=package.json)

## Behaviour

The final OAuth secured Node.js API code sample, referenced in my blog at https://authguidance.com:

- The API has a fictional business area of `investments`, but simply returns hard coded data
- The API takes finer control over OAuth and claims to enable the best security with good manageability
- The API uses structured logging and log aggregation, for the best supportability

### API integrates with UI Clients

The API can run as part of an OAuth end-to-end setup, to serve my blog's UI code samples.\
Running the API in this manner forces it to be consumer focused to its clients:

![SPA and API](./images/spa-and-api.png)

### API can be Productively Tested

The API's clients are UIs, which get user level access tokens by running an OpenID Connect code flow.\
For productive test driven development, the API instead mocks the Authorization Server:

![Test Driven Development](./images/tests.png)

### API can be Load Tested

A basic load test uses promises to fire 5 parallel requests at a time at the API.\
This ensures no concurrency problems, and error rehearsal is used to ensure useful error responses:

![Load Test](./images/loadtest.png)

### API is Supportable

API logs can be analysed in use case based manner by running Elasticsearch SQL and Lucene queries.\
Follow the [Technical Support Queries](https://authguidance.com/2019/08/02/intelligent-api-platform-analysis/) for some people friendly examples:

![Support Queries](./images/support-queries.png)

## Commands

### Prerequisites

- Ensure that Node.js 18 or later is installed
- Integration tests run Wiremock in Docker, so ensure that Docker is installed

### Run the API

Run the API with this command:

```bash
./start.sh
```

### Configure DNS

Configure DNS by adding these domains to your hosts file:

```text
127.0.0.1 localhost apilocal.authsamples-dev.com login.authsamples-dev.com
```

Then call an endpoint over port 446:

```bash
curl -k https://apilocal.authsamples-dev.com:446/investments/companies
```

### Test the API

Stop the API, then re-run it with a test configuration:

```bash
npm run testsetup
```

Then run integration tests and a load test:

```bash
npm test
npm run loadtest
```

## Further Details

* See the [API Journey - Server Side](https://authguidance.com/api-journey-server-side/) for further information on the API behaviour
* See the [Overview Page](https://authguidance.com/api-architecture-node/) for further details on running the API
* See the [Coding Key Points Page](https://authguidance.com/final-nodeapi-coding-key-points/) for key implementation details

## Programming Languages

* Node.js with TypeScript is used to implement the REST API

## Infrastructure

* Express is used to host the API over SSL
* AWS Cognito is used as the default Authorization Server
* The [jose](https://github.com/panva/jose) library is used to manage in memory validation of JWTs
* The project includes API deployment resources for Docker and Kubernetes
