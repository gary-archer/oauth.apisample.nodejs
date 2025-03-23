# Final OAuth Node.js API

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/adc8714adb3446f3858f16e15c2118e0)](https://app.codacy.com/gh/gary-archer/oauth.apisample.nodejs?utm_source=github.com&utm_medium=referral&utm_content=gary-archer/oauth.apisample.nodejs&utm_campaign=Badge_Grade)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.apisample.nodejs/badge.svg?targetFile=package.json)](https://snyk.io/test/github/gary-archer/oauth.apisample.nodejs?targetFile=package.json)

The final OAuth secured Node.js API code sample, which returns mock `investments` data:

- The API takes finer control over claims-based authorization to enable security with good manageability.
- The API uses structured logging and log aggregation, for the best supportability.

### API Serves Frontend Clients

The API can run as part of an OAuth end-to-end setup, to serve my blog's UI code samples.\
Running the API in this manner forces it to be consumer-focused to its clients:

![SPA and API](./images/spa-and-api.png)

### API Security is Testable

The API's clients are UIs, which get user-level access tokens by running an OpenID Connect code flow.\
For productive test-driven development, the API instead mocks the authorization server:

![Test Driven Development](./images/tests.png)

A basic load test fires batches of concurrent requests at the API.\
This further verifies reliability and the correctness of API logs.

![Load Test](./images/loadtest.png)

### API is Supportable

You can aggregate API logs to Elasticsearch and run [Technical Support Queries](https://github.com/gary-archer/oauth.blog/tree/master/public/posts/api-technical-support-analysis.mdx).

![Support Queries](./images/support-queries.jpg)

## Local Development Quick Start

To run the code sample locally you must configure some infrastructure before you run the code.

### Configure DNS and SSL

Configure custom development domains by adding these DNS entries to your hosts file:

```bash
127.0.0.1 localhost api.authsamples-dev.com login.authsamples-dev.com
```

Install OpenSSL 3+ if required, create a secrets folder, then create development certificates:

```bash
export SECRETS_FOLDER="$HOME/secrets"
mkdir -p "$SECRETS_FOLDER"
./certs/create.sh
```

If required, configure [Node.js SSL trust](
https://github.com/gary-archer/oauth.blog/tree/master/public/posts/developer-ssl-setup.mdx#trusting-a-root-certificate-in-nodejs-apis) for the root CA at the following location:

```text
./certs/authsamples-dev.ca.crt
```

### Run the Code

- Install Node.js 20+.
- Also install Docker to run integration tests that use Wiremock.

Then run the API with this command:

```bash
./start.sh
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

* See the [API Journey - Server Side](https://github.com/gary-archer/oauth.blog/tree/master/public/posts/api-journey-server-side.mdx) for further information on the API's behaviour.
* See the [Overview Page](https://github.com/gary-archer/oauth.blog/tree/master/public/posts/api-architecture-node.mdx) for further details on how to run the API.
* See the [Code Overview](https://github.com/gary-archer/oauth.blog/tree/master/public/posts/final-nodeapi-coding-key-points.mdx) for some implementation details.

## Programming Languages

* The API uses Node.js and TypeScript.

## Infrastructure

* Express is the HTTP server that hosts the API endpoints.
* AWS Cognito is the API's default authorization server.
* The [jose](https://github.com/panva/jose) library manages in-memory JWT validation.
* The project includes API deployment resources for Docker and Kubernetes.
