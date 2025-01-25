#!/bin/bash

. scripts/envVar.sh

CHANNEL_NAME="$1"
DELAY="$2"
MAX_RETRY="$3"
VERBOSE="$4"

: ${CHANNEL_NAME:="autentikasich"}
: ${DELAY:="3"}
: ${MAX_RETRY:="5"}
: ${VERBOSE:="false"}

createChannel() {
	# Poll in case the raft leader is not set yet
	local rc=1
	local COUNTER=1
	infoln "Adding orderers"
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ]; do
		sleep $DELAY
		set -x
		. scripts/orderer0-filkom.sh ${CHANNEL_NAME} >/dev/null 2>&1
		. scripts/orderer0-fh.sh ${CHANNEL_NAME} >/dev/null 2>&1
		. scripts/orderer0-feb.sh ${CHANNEL_NAME} >/dev/null 2>&1
		res=$?
		{ set +x; } 2>/dev/null
		let rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done
	cat log.txt
	verifyResult $res "Channel creation failed"
}

# joinChannel ORG
joinChannel() {
	ORG=$1
	setGlobals $ORG
	local rc=1
	local COUNTER=1
	## Sometimes Join takes time, hence retry
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ]; do
		sleep $DELAY
		set -x
		peer channel join -b $BLOCKFILE >&log.txt
		res=$?
		{ set +x; } 2>/dev/null
		let rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done
	cat log.txt
	verifyResult $res "After $MAX_RETRY attempts, ${ORG} has failed to join channel '$CHANNEL_NAME' "
}

setAnchorPeer() {
	ORG=$1
	. scripts/setAnchorPeer.sh $ORG $CHANNEL_NAME
}

BLOCKFILE="./channel-artifacts/${CHANNEL_NAME}.block"

if [ $CHANNEL_NAME = "autentikasich" ]; then
	## Create channel
	infoln "Creating channel ${CHANNEL_NAME}"
	createChannel
	successln "Channel '$CHANNEL_NAME' created"

	## Join all the peers to the channel
	infoln "Joining peer0.filkom to the channel ${CHANNEL_NAME}"
	joinChannel peer0.filkom
	infoln "Joining peer0.fh to the channel ${CHANNEL_NAME}"
	joinChannel peer0.fh
	infoln "Joining peer0.feb to the channel ${CHANNEL_NAME}"
	joinChannel peer0.feb

	## Set the anchor peers for each org in the channel
	infoln "Setting anchor peer for org filkom..."
	setAnchorPeer peer0.filkom
	infoln "Setting anchor peer for org fh..."
	setAnchorPeer peer0.fh
	infoln "Setting anchor peer for org feb..."
	setAnchorPeer peer0.feb

else
	## Create channel
	infoln "Creating channel ${CHANNEL_NAME}"
	createChannel
	successln "Channel '$CHANNEL_NAME' created"

	## Join all the peers to the channel
	infoln "Joining peer1.filkom to the channel ${CHANNEL_NAME}"
	joinChannel peer1.filkom
	infoln "Joining peer1.fh to the channel ${CHANNEL_NAME}"
	joinChannel peer1.fh
	infoln "Joining peer1.feb to the channel ${CHANNEL_NAME}"
	joinChannel peer1.feb

	## Set the anchor peers for each org in the channel
	infoln "Setting anchor peer for org filkom..."
	setAnchorPeer peer1.filkom
	infoln "Setting anchor peer for org fh..."
	setAnchorPeer peer1.fh
	infoln "Setting anchor peer for org feb..."
	setAnchorPeer peer1.feb
fi

successln "Channel '$CHANNEL_NAME' joined"
