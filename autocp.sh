#!/bin/bash
VM1="ubuntu@ec2-98-85-104-168.compute-1.amazonaws.com"
VM2="ubuntu@ec2-3-84-181-32.compute-1.amazonaws.com"
VM3="ubuntu@ec2-23-22-50-22.compute-1.amazonaws.com"
KEY_PATH="./labsuser.pem"
PREREQ_PATH="./prereq.sh"
NETWORK_PATH="network"
DESTINATION_PATH="/home/ubuntu/"
NOTE_PATH="./peer.txt"
CRYPTO_PATH_VM="/home/ubuntu/network/fabric/organizations"
ARTIFACTS_PATH_VM="/home/ubuntu/network/fabric/channel-artifacts"
CRYPTO_PATH_LOCAL="organizations"
ARTIFACTS_PATH_LOCAL="channel-artifacts"
DESTINATION_CRYPTO_PATH="/home/ubuntu/network/fabric/"
LOCAL_PATH="./"

function copyPrereq() {
    scp -i ${KEY_PATH} ${PREREQ_PATH} ${VM1}:${DESTINATION_PATH}
    scp -i ${KEY_PATH} ${PREREQ_PATH} ${VM2}:${DESTINATION_PATH}
    scp -i ${KEY_PATH} ${PREREQ_PATH} ${VM3}:${DESTINATION_PATH}
}

function copyNetwork() {
    scp -i ${KEY_PATH} -r ${NETWORK_PATH} ${VM1}:${DESTINATION_PATH}
    scp -i ${KEY_PATH} -r ${NETWORK_PATH} ${VM2}:${DESTINATION_PATH}
    scp -i ${KEY_PATH} -r ${NETWORK_PATH} ${VM3}:${DESTINATION_PATH}
}

function writeNote() {
    echo "List Peer:" >$NOTE_PATH
    echo "VM1 = ${VM1}" >>$NOTE_PATH
    echo "VM2 = ${VM2}" >>$NOTE_PATH
    echo "VM3 = ${VM3}" >>$NOTE_PATH
    echo "" >>$NOTE_PATH
    echo "SSH Instances:" >>$NOTE_PATH
    echo "ssh -i ${KEY_PATH} ${VM1}" >>$NOTE_PATH
    echo "ssh -i ${KEY_PATH} ${VM2}" >>$NOTE_PATH
    echo "ssh -i ${KEY_PATH} ${VM3}" >>$NOTE_PATH
    echo "" >>$NOTE_PATH
    echo "Copy Manual Network Folder (If not copy yet):" >>$NOTE_PATH
    echo "scp -i ${KEY_PATH} -r ${NETWORK_PATH} ${VM1}:${DESTINATION_PATH}" >>$NOTE_PATH
    echo "scp -i ${KEY_PATH} -r ${NETWORK_PATH} ${VM2}:${DESTINATION_PATH}" >>$NOTE_PATH
    echo "scp -i ${KEY_PATH} -r ${NETWORK_PATH} ${VM3}:${DESTINATION_PATH}" >>$NOTE_PATH
    echo "" >>$NOTE_PATH
    echo "Copy Organization & Channel-artifatcs Folder To Local:" >>$NOTE_PATH
    echo "scp -i ${KEY_PATH} -r ${VM1}:${CRYPTO_PATH_VM} ${VM1}:${ARTIFACTS_PATH_VM} ${LOCAL_PATH}" >>$NOTE_PATH
    echo "" >>$NOTE_PATH
    echo "Copy Organization & Channel-artifatcs Folder To VM2 and VM3:" >>$NOTE_PATH
    echo "scp -i ${KEY_PATH} -r ${CRYPTO_PATH_LOCAL} ${ARTIFACTS_PATH_LOCAL} ${VM2}:${DESTINATION_CRYPTO_PATH}" >>$NOTE_PATH
    echo "scp -i ${KEY_PATH} -r ${CRYPTO_PATH_LOCAL} ${ARTIFACTS_PATH_LOCAL} ${VM3}:${DESTINATION_CRYPTO_PATH}" >>$NOTE_PATH
    echo "" >>$NOTE_PATH
    echo "For Create Docker Swarm" >>$NOTE_PATH
    echo "docker swarm init --advertise-addr {IP}" >>$NOTE_PATH
    echo "docker swarm join-token manager" >>$NOTE_PATH
    echo "Join with token manager on other VM!! with --advertise-addr {IP}" >>$NOTE_PATH
    echo "docker network create --attachable --driver overlay fabric-pemilwa" >>$NOTE_PATH
    echo "" >>$NOTE_PATH
    echo "Additional Note" >>$NOTE_PATH
    echo "Copy Organization & Channel-artifacts folder to vm1" >>$NOTE_PATH
    echo "scp -i ${KEY_PATH} -r ${CRYPTO_PATH_LOCAL} ${ARTIFACTS_PATH_LOCAL} ${VM1}:${DESTINATION_CRYPTO_PATH}" >>$NOTE_PATH
}

copyPrereq
copyNetwork
writeNote
