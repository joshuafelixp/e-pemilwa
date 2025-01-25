#!/bin/bash

source scripts/utils.sh

CHANNEL_NAME=${1:-"mychannel"}
CC_NAME=${2}
CC_SRC_PATH=${3}
CC_SRC_LANGUAGE=${4}
CC_VERSION=${5:-"1.0"}
CC_SEQUENCE=${6:-"1"}
CC_INIT_FCN=${7:-"NA"}
CC_END_POLICY=${8:-"NA"}
CC_COLL_CONFIG=${9:-"NA"}
DELAY=${10:-"3"}
MAX_RETRY=${11:-"5"}
VERBOSE=${12:-"false"}

println "executing with the following"
println "- CHANNEL_NAME: ${C_GREEN}${CHANNEL_NAME}${C_RESET}"
println "- CC_NAME: ${C_GREEN}${CC_NAME}${C_RESET}"
println "- CC_SRC_PATH: ${C_GREEN}${CC_SRC_PATH}${C_RESET}"
println "- CC_SRC_LANGUAGE: ${C_GREEN}${CC_SRC_LANGUAGE}${C_RESET}"
println "- CC_VERSION: ${C_GREEN}${CC_VERSION}${C_RESET}"
println "- CC_SEQUENCE: ${C_GREEN}${CC_SEQUENCE}${C_RESET}"
println "- CC_END_POLICY: ${C_GREEN}${CC_END_POLICY}${C_RESET}"
println "- CC_COLL_CONFIG: ${C_GREEN}${CC_COLL_CONFIG}${C_RESET}"
println "- CC_INIT_FCN: ${C_GREEN}${CC_INIT_FCN}${C_RESET}"
println "- DELAY: ${C_GREEN}${DELAY}${C_RESET}"
println "- MAX_RETRY: ${C_GREEN}${MAX_RETRY}${C_RESET}"
println "- VERBOSE: ${C_GREEN}${VERBOSE}${C_RESET}"

INIT_REQUIRED="--init-required"
# check if the init fcn should be called
if [ "$CC_INIT_FCN" = "NA" ]; then
  INIT_REQUIRED=""
fi

if [ "$CC_END_POLICY" = "NA" ]; then
  CC_END_POLICY=""
else
  CC_END_POLICY="--signature-policy $CC_END_POLICY"
fi

if [ "$CC_COLL_CONFIG" = "NA" ]; then
  CC_COLL_CONFIG=""
else
  CC_COLL_CONFIG="--collections-config $CC_COLL_CONFIG"
fi

# import utils
. scripts/envVar.sh
. scripts/ccutils.sh

function checkPrereqs() {
  jq --version >/dev/null 2>&1

  if [[ $? -ne 0 ]]; then
    errorln "jq command not found..."
    errorln
    errorln "Follow the instructions in the Fabric docs to install the prereqs"
    errorln "https://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html"
    exit 1
  fi
}

## package the chaincode
./scripts/packageCC.sh $CC_NAME $CC_SRC_PATH $CC_SRC_LANGUAGE $CC_VERSION

PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid ${CC_NAME}.tar.gz)

if [ "$CHANNEL_NAME" = "autentikasich" ]; then
  ## Install chaincode on all peer
  infoln "Installing chaincode on peer0.filkom..."
  installChaincode peer0.filkom
  infoln "Install chaincode on peer0.fh..."
  installChaincode peer0.fh
  infoln "Install chaincode on peer0.feb..."
  installChaincode peer0.feb

  resolveSequence

  ## query whether the chaincode is installed
  queryInstalled peer0.filkom
  queryInstalled peer0.fh
  queryInstalled peer0.feb

  ## approve the definition for org filkom
  approveForMyOrg peer0.filkom
  ## check whether the chaincode definition is ready to be committed
  ## expect org filkom to have approved and org fh and feb not to
  checkCommitReadiness peer0.filkom "\"filkomMSP\": true" "\"fhMSP\": false" "\"febMSP\": false"
  checkCommitReadiness peer0.fh "\"filkomMSP\": true" "\"fhMSP\": false" "\"febMSP\": false"
  checkCommitReadiness peer0.feb "\"filkomMSP\": true" "\"fhMSP\": false" "\"febMSP\": false"

  ## now approve also for org fh
  approveForMyOrg peer0.fh
  ## check whether the chaincode definition is ready to be committed
  ## expect 2 aprroved
  checkCommitReadiness peer0.filkom "\"filkomMSP\": true" "\"fhMSP\": true" "\"febMSP\": false"
  checkCommitReadiness peer0.fh "\"filkomMSP\": true" "\"fhMSP\": true" "\"febMSP\": false"
  checkCommitReadiness peer0.feb "\"filkomMSP\": true" "\"fhMSP\": true" "\"febMSP\": false"

  ## now approve also for org feb
  approveForMyOrg peer0.feb
  ## check whether the chaincode definition is ready to be committed
  ## expect all aprroved
  checkCommitReadiness peer0.filkom "\"filkomMSP\": true" "\"fhMSP\": true" "\"febMSP\": true"
  checkCommitReadiness peer0.fh "\"filkomMSP\": true" "\"fhMSP\": true" "\"febMSP\": true"
  checkCommitReadiness peer0.feb "\"filkomMSP\": true" "\"fhMSP\": true" "\"febMSP\": true"

  ## now that we know for sure all orgs have approved, commit the definition
  commitChaincodeDefinition peer0.filkom peer0.fh peer0.feb

  ## query on all orgs to see that the definition committed successfully
  queryCommitted peer0.filkom
  queryCommitted peer0.fh
  queryCommitted peer0.feb

  ## Invoke the chaincode - this does require that the chaincode have the 'initLedger'
  ## method defined
  if [ "$CC_INIT_FCN" = "NA" ]; then
    infoln "Chaincode initialization is not required"
  else
    chaincodeInvokeInit peer0.filkom peer0.fh peer0.feb
  fi

  exit 0

else
  ## Install chaincode on all peer
  infoln "Installing chaincode on peer1.filkom..."
  installChaincode peer1.filkom
  infoln "Install chaincode on peer1.fh..."
  installChaincode peer1.fh
  infoln "Install chaincode on peer1.feb..."
  installChaincode peer1.feb

  resolveSequence

  ## query whether the chaincode is installed
  queryInstalled peer1.filkom
  queryInstalled peer1.fh
  queryInstalled peer1.feb

  ## approve the definition for org filkom
  approveForMyOrg peer1.filkom
  ## check whether the chaincode definition is ready to be committed
  ## expect org filkom to have approved and org fh and feb not to
  checkCommitReadiness peer1.filkom "\"filkomMSP\": true" "\"fhMSP\": false" "\"febMSP\": false"
  checkCommitReadiness peer1.fh "\"filkomMSP\": true" "\"fhMSP\": false" "\"febMSP\": false"
  checkCommitReadiness peer1.feb "\"filkomMSP\": true" "\"fhMSP\": false" "\"febMSP\": false"

  ## now approve also for org fh
  approveForMyOrg peer1.fh
  ## check whether the chaincode definition is ready to be committed
  ## expect 2 aprroved
  checkCommitReadiness peer1.filkom "\"filkomMSP\": true" "\"fhMSP\": true" "\"febMSP\": false"
  checkCommitReadiness peer1.fh "\"filkomMSP\": true" "\"fhMSP\": true" "\"febMSP\": false"
  checkCommitReadiness peer1.feb "\"filkomMSP\": true" "\"fhMSP\": true" "\"febMSP\": false"

  ## now approve also for org feb
  approveForMyOrg peer1.feb
  ## check whether the chaincode definition is ready to be committed
  ## expect all aprroved
  checkCommitReadiness peer1.filkom "\"filkomMSP\": true" "\"fhMSP\": true" "\"febMSP\": true"
  checkCommitReadiness peer1.fh "\"filkomMSP\": true" "\"fhMSP\": true" "\"febMSP\": true"
  checkCommitReadiness peer1.feb "\"filkomMSP\": true" "\"fhMSP\": true" "\"febMSP\": true"

  ## now that we know for sure all orgs have approved, commit the definition
  commitChaincodeDefinition peer1.filkom peer1.fh peer1.feb

  ## query on all orgs to see that the definition committed successfully
  queryCommitted peer1.filkom
  queryCommitted peer1.fh
  queryCommitted peer1.feb

  ## Invoke the chaincode - this does require that the chaincode have the 'initLedger'
  ## method defined
  if [ "$CC_INIT_FCN" = "NA" ]; then
    infoln "Chaincode initialization is not required"
  else
    chaincodeInvokeInit peer1.filkom peer1.fh peer1.feb
  fi

  exit 0

fi
