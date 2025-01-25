#!/bin/bash

##  Utils   ##
C_RESET='\033[0m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_BLUE='\033[0;34m'
C_YELLOW='\033[1;33m'

# println echos string
function println() {
    echo -e "$1"
}

# errorln echos i red color
function errorln() {
    println "${C_RED}${1}${C_RESET}"
}

# successln echos in green color
function successln() {
    println "${C_GREEN}${1}${C_RESET}"
}

# infoln echos in blue color
function infoln() {
    println "${C_BLUE}${1}${C_RESET}"
}

# warnln echos in yellow color
function warnln() {
    println "${C_YELLOW}${1}${C_RESET}"
}

# fatalln echos in red color and exits with fail status
function fatalln() {
    errorln "$1"
    exit 1
}
##  Utils   ##

function installDocker() {
    sudo apt update
    sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
    sudo apt update
    sudo apt install docker-ce -y
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ${USER}
    successln "Success install Docker Engine"
    infoln
}

function installDockerCompose() {
    mkdir -p ~/.docker/cli-plugins/
    curl -SL https://github.com/docker/compose/releases/download/v2.29.1/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
    chmod +x ~/.docker/cli-plugins/docker-compose
    successln "Success install Docker Compose"
    infoln
}

function installJq() {
    sudo apt install jq -y
    successln "Success install Jq"
    infoln
}

function installHlf() {
    mkdir -p ~/network && cd ~/network
    curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh && chmod +x install-fabric.sh
    sudo ./install-fabric.sh -f 2.5.10 -c 1.5.13 d b
    successln "Success download Hyperledger Fabric"
    infoln
}

#Install docker engine
infoln "Install Dockker Engine"
installDocker

#Install docker compose
infoln "Install Dockker Compose"
installDockerCompose

#Install jq
infoln "Install Jq"
installJq

#Install hlf
infoln "Install Hyperledger Fabric"
installHlf

warnln "!!! DON'T FORGET TO RELOG FOR USING DOCKER WITHOUT SUDO !!!"
warnln "Otherwise, it may cause an error when installing fabric network."
infoln
