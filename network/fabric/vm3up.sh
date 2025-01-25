#!/bin/bash
ROOTDIR=$(cd "$(dirname "$0")" && pwd)
export PATH=${ROOTDIR}/../bin:${PWD}/../bin:$PATH

# push to the required directory & set a trap to go back if needed
pushd ${ROOTDIR} >/dev/null
trap "popd > /dev/null" EXIT

. scripts/utils.sh

function networkUp() {
    if [ ! -d "organizations/peerOrganizations" ]; then
        fatalln "Make sure you have created crypto-material and copy to all vm!!"
    fi

    COMPOSE_FILES_PEER="-c compose/compose-peer-vm3.yaml"

    DOCKER_SOCK="${DOCKER_SOCK}" docker stack deploy ${COMPOSE_FILES_PEER} fabric-pemilwa 2>&1

    if [ $? -ne 0 ]; then
        fatalln "Unable to up peer and orderer for vm3"
    fi

    successln "Successfully up peer and orderer for vm3"
}

# Get docker sock path from environment variable
SOCK="${DOCKER_HOST:-/var/run/docker.sock}"
DOCKER_SOCK="${SOCK##unix://}"

infoln "Up peer and orderer for vm3"
networkUp
