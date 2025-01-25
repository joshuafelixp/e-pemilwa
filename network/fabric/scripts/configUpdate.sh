#!/bin/bash

ROOTPATH=${ROOTPATH:-${PWD}}
. ${ROOTPATH}/scripts/envVar.sh

# fetchChannelConfig <org> <channel_id> <output_json>
# Writes the current channel config for a given channel to a JSON file
# NOTE: this requires jq and configtxlator for execution.
fetchChannelConfig() {
  ORG=$1
  CHANNEL=$2
  OUTPUT=$3

  setGlobals $ORG

  infoln "Fetching the most recent configuration block for the channel"
  set -x
  peer channel fetch config ${ROOTPATH}/channel-artifacts/config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer0.filkom-orderer.pemilwa.com -c $CHANNEL --tls --cafile "$ORDERER_FILKOM_CA"
  { set +x; } 2>/dev/null

  infoln "Decoding config block to JSON and isolating config to ${OUTPUT}"
  set -x
  configtxlator proto_decode --input ${ROOTPATH}/channel-artifacts/config_block.pb --type common.Block --output ${ROOTPATH}/channel-artifacts/config_block.json
  jq .data.data[0].payload.data.config ${ROOTPATH}/channel-artifacts/config_block.json >"${OUTPUT}"
  res=$?
  { set +x; } 2>/dev/null
  verifyResult $res "Failed to parse channel configuration, make sure you have jq installed"
}

# createConfigUpdate <channel_id> <original_config.json> <modified_config.json> <output.pb>
# Takes an original and modified config, and produces the config update tx
# which transitions between the two
# NOTE: this requires jq and configtxlator for execution.
createConfigUpdate() {
  CHANNEL=$1
  ORIGINAL=$2
  MODIFIED=$3
  OUTPUT=$4

  set -x
  configtxlator proto_encode --input "${ORIGINAL}" --type common.Config --output ${ROOTPATH}/channel-artifacts/original_config.pb
  configtxlator proto_encode --input "${MODIFIED}" --type common.Config --output ${ROOTPATH}/channel-artifacts/modified_config.pb
  configtxlator compute_update --channel_id "${CHANNEL}" --original ${ROOTPATH}/channel-artifacts/original_config.pb --updated ${ROOTPATH}/channel-artifacts/modified_config.pb --output ${ROOTPATH}/channel-artifacts/config_update.pb
  configtxlator proto_decode --input ${ROOTPATH}/channel-artifacts/config_update.pb --type common.ConfigUpdate --output ${ROOTPATH}/channel-artifacts/config_update.json
  echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL'", "type":2}},"data":{"config_update":'$(cat ${ROOTPATH}/channel-artifacts/config_update.json)'}}}' | jq . >${ROOTPATH}/channel-artifacts/config_update_in_envelope.json
  configtxlator proto_encode --input ${ROOTPATH}/channel-artifacts/config_update_in_envelope.json --type common.Envelope --output "${OUTPUT}"
  { set +x; } 2>/dev/null
}

# signConfigtxAsPeerOrg <org> <configtx.pb>
# Set the peerOrg admin of an org and sign the config update
signConfigtxAsPeerOrg() {
  ORG=$1
  CONFIGTXFILE=$2
  setGlobals $ORG
  set -x
  peer channel signconfigtx -f "${CONFIGTXFILE}"
  { set +x; } 2>/dev/null
}
