#!/bin/bash

ROOTDIR=$(cd "$(dirname "$0")" && pwd)
export PATH=${ROOTDIR}/../bin:${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${PWD}/config

# push to the required directory & set a trap to go back if needed
pushd ${ROOTDIR} >/dev/null
trap "popd > /dev/null" EXIT

. scripts/utils.sh
. scripts/envVar.sh

createChannelGenesisBlock() {
    if [ ! -d "channel-artifacts" ]; then
        mkdir channel-artifacts
    fi
    ORG=$1
    setGlobals $ORG
    which configtxgen
    if [ "$?" -ne 0 ]; then
        fatalln "configtxgen tool not found."
    fi
    set -x
    configtxgen -profile ChannelUsingRaft -outputBlock ./channel-artifacts/${CHANNEL_NAME}.block -channelID $CHANNEL_NAME
    res=$?
    { set +x; } 2>/dev/null
    verifyResult $res "Failed to generate channel configuration transaction..."
}

CHANNEL_NAME=votingch
infoln "Generating channel genesis block '${CHANNEL_NAME}.block'"
createChannelGenesisBlock peer1.filkom
