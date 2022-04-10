#!/bin/bash

###################################################
# A script to run integration tests against the API
###################################################

cd "$(dirname "${BASH_SOURCE[0]}")"
TYPE="$1"

#
# Copy down the test configuration, to point the API to Wiremock rather than AWS Cognito
#
cp environments/test.config.json ./api.config.json

#
# Get the platform
#
case "$(uname -s)" in

  Darwin)
    PLATFORM='MACOS'
 	;;

  MINGW64*)
    PLATFORM='WINDOWS'
	;;
esac

#
# Run Wiremock and the API in child windows
#
echo 'Running Wiremock and API ...'
if [ "$PLATFORM" == 'MACOS' ]; then
    open -a Terminal ./test/run_wiremock.sh
    open -a Terminal ./test/run_api.sh
else
    "$GIT_BASH" -c ./test/run_wiremock.sh &
    "$GIT_BASH" -c ./test/run_api.sh &
fi

#
# Wait for endpoints to become available
#
echo 'Waiting for Wiremock endpoints to come up ...'
WIREMOCK_URL='http://login.mycompany.com/__admin/mappings'
while [ "$(curl -k -s -X GET -o /dev/null -w '%{http_code}' "$WIREMOCK_URL")" != '200' ]; do
    sleep 2
done

echo 'Waiting for API endpoints to come up ...'
API_URL='https://api.authsamples-dev.com:445/api/companies'
while [ "$(curl -k -s -X GET -o /dev/null -w '%{http_code}' "$API_URL")" != '401' ]; do
    sleep 2
done

#
# Tests will call the API over SSL, so trust the development root certificate
#
export NODE_EXTRA_CA_CERTS='./certs/authsamples-dev.ca.pem'

#
# Run the integration tests
#
if [ "$TYPE" == 'INTEGRATION' ]; then

    echo 'Running integration tests ...'
    ./node_modules/.bin/mocha -r ts-node/register test/integrationTests.ts

elif [ "$TYPE" == 'LOAD' ]; then

    echo 'Running load test ...'
    ts-node test/loadTest.ts
fi

#
# Restore the API configuration
#
#cp environments/api.config.json ./api.config.json
