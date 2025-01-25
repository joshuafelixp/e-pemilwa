#!/bin/bash

ROOTDIR=$(cd "$(dirname "$0")" && pwd)
export PATH=${ROOTDIR}/../bin:${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${PWD}/config

# push to the required directory & set a trap to go back if needed
pushd ${ROOTDIR} >/dev/null
trap "popd > /dev/null" EXIT

. scripts/utils.sh

function createChannel() {

    CONTAINERS=($(docker ps | grep hyperledger/ | awk '{print $2}'))

    if [[ ${#CONTAINERS[@]} -eq 0 ]] || [[ ! -d "organizations/peerOrganizations" ]]; then
        fatalln "Bring network up first!"
    fi

    #scripts/createChannel.sh $CHANNEL_NAME $CLI_DELAY $MAX_RETRY $VERBOSE
    scripts/createChannel.sh autentikasich
}

infoln "Creating channel autentikasich..."
createChannel
