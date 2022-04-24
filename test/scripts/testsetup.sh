#!/bin/bash

########################################################################
# A script to run the API with a test configuration, along with Wiremock
########################################################################

cd "$(dirname "${BASH_SOURCE[0]}")"
cd ../..

#
# Download development SSL certificates if required
#
./downloadcerts.sh
if [ $? -ne 0 ]; then
    exit
fi

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
# Install dependencies if needed
#
if [ ! -d 'node_modules' ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo 'Problem encountered building the API'
        exit
    fi
fi

#
# Run Wiremock and the API in child windows
#
echo 'Running Wiremock and API ...'
if [ "$PLATFORM" == 'MACOS' ]; then
    open -a Terminal ./test/scripts/run_wiremock.sh
    open -a Terminal ./test/scripts/run_api.sh
else
    "$GIT_BASH" -c ./test/scripts/run_wiremock.sh &
    "$GIT_BASH" -c ./test/scripts/run_api.sh &
fi

#
# Wait for endpoints to become available
#
echo 'Waiting for Wiremock endpoints to come up ...'
WIREMOCK_URL='http://login.authsamples-dev.com:446/__admin/mappings'
while [ "$(curl -k -s -X GET -o /dev/null -w '%{http_code}' "$WIREMOCK_URL")" != '200' ]; do
    sleep 2
done

echo 'Waiting for API endpoints to come up ...'
API_URL='https://api.authsamples-dev.com:445/api/companies'
while [ "$(curl -k -s -X GET -o /dev/null -w '%{http_code}' "$API_URL")" != '401' ]; do
    sleep 2
done

#
# Restore the API configuration once the API is loaded
#
cp environments/api.config.json ./api.config.json

#
# Indicate success
#
echo "Start tests via 'npm test' or 'npm run loadtest' ..."
