#!/bin/bash

ROOTPATH=${ROOTPATH:-${PWD}}
. ${ROOTPATH}/scripts/utils.sh

export CORE_PEER_TLS_ENABLED=true
export ORDERER_FILKOM_CA=${ROOTPATH}/organizations/ordererOrganizations/filkom-orderer.pemilwa.com/tlsca/tlsca.filkom-orderer.pemilwa.com-cert.pem
export ORDERER_FH_CA=${ROOTPATH}/organizations/ordererOrganizations/fh-orderer.pemilwa.com/tlsca/tlsca.fh-orderer.pemilwa.com-cert.pem
export ORDERER_FEB_CA=${ROOTPATH}/organizations/ordererOrganizations/feb-orderer.pemilwa.com/tlsca/tlsca.feb-orderer.pemilwa.com-cert.pem
export PEER_FILKOM_CA=${ROOTPATH}/organizations/peerOrganizations/filkom.pemilwa.com/tlsca/tlsca.filkom.pemilwa.com-cert.pem
export PEER_FH_CA=${ROOTPATH}/organizations/peerOrganizations/fh.pemilwa.com/tlsca/tlsca.fh.pemilwa.com-cert.pem
export PEER_FEB_CA=${ROOTPATH}/organizations/peerOrganizations/feb.pemilwa.com/tlsca/tlsca.feb.pemilwa.com-cert.pem

# Set environment variables for the peer org
setGlobals() {
  local USING_ORG=""
  if [ -z "$OVERRIDE_ORG" ]; then
    USING_ORG=$1
  else
    USING_ORG="${OVERRIDE_ORG}"
  fi
  infoln "Using organization ${USING_ORG}"
  if [ $USING_ORG = "peer0.filkom" ]; then
    export CORE_PEER_LOCALMSPID=filkomMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER_FILKOM_CA
    export CORE_PEER_MSPCONFIGPATH=${ROOTPATH}/organizations/peerOrganizations/filkom.pemilwa.com/users/Admin@filkom.pemilwa.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
  elif [ $USING_ORG = "peer0.fh" ]; then
    export CORE_PEER_LOCALMSPID=fhMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER_FH_CA
    export CORE_PEER_MSPCONFIGPATH=${ROOTPATH}/organizations/peerOrganizations/fh.pemilwa.com/users/Admin@fh.pemilwa.com/msp
    export CORE_PEER_ADDRESS=localhost:8051
  elif [ $USING_ORG = "peer0.feb" ]; then
    export CORE_PEER_LOCALMSPID=febMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER_FEB_CA
    export CORE_PEER_MSPCONFIGPATH=${ROOTPATH}/organizations/peerOrganizations/feb.pemilwa.com/users/Admin@feb.pemilwa.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
  elif [ $USING_ORG = "peer1.filkom" ]; then
    export CORE_PEER_LOCALMSPID=filkomMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER_FILKOM_CA
    export CORE_PEER_MSPCONFIGPATH=${ROOTPATH}/organizations/peerOrganizations/filkom.pemilwa.com/users/Admin@filkom.pemilwa.com/msp
    export CORE_PEER_ADDRESS=localhost:10051
  elif [ $USING_ORG = "peer1.fh" ]; then
    export CORE_PEER_LOCALMSPID=fhMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER_FH_CA
    export CORE_PEER_MSPCONFIGPATH=${ROOTPATH}/organizations/peerOrganizations/fh.pemilwa.com/users/Admin@fh.pemilwa.com/msp
    export CORE_PEER_ADDRESS=localhost:11051
  elif [ $USING_ORG = "peer1.feb" ]; then
    export CORE_PEER_LOCALMSPID=febMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER_FEB_CA
    export CORE_PEER_MSPCONFIGPATH=${ROOTPATH}/organizations/peerOrganizations/feb.pemilwa.com/users/Admin@feb.pemilwa.com/msp
    export CORE_PEER_ADDRESS=localhost:12051
  else
    errorln "ORG Unknown"
  fi

  if [ "$VERBOSE" = "true" ]; then
    env | grep CORE
  fi
}

# parsePeerConnectionParameters $@
# Helper function that sets the peer connection parameters for a chaincode
# operation
parsePeerConnectionParameters() {
  PEER_CONN_PARMS=()
  PEERS=""
  while [ "$#" -gt 0 ]; do
    setGlobals $1
    PEER="$1"
    ## Set peer addresses
    if [ -z "$PEERS" ]; then
      PEERS="$PEER"
    else
      PEERS="$PEERS $PEER"
    fi
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" --peerAddresses $CORE_PEER_ADDRESS)
    ## Set path to TLS certificate
    CA=$CORE_PEER_TLS_ROOTCERT_FILE
    TLSINFO=(--tlsRootCertFiles "${CA}")
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" "${TLSINFO[@]}")
    # shift by one to get to the next organization
    shift
  done
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    fatalln "$2"
  fi
}
