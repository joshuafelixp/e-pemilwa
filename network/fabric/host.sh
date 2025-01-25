#!/bin/bash
. .env

function changeHostnameVM1() {
    HOSTNAME=${VM1_HOSTNAME}
    sed -i "s/node.hostname ==/node.hostname == $HOSTNAME/g" "compose/compose-couch-vm1.yaml"
    sed -i "s/node.hostname ==/node.hostname == $HOSTNAME/g" "compose/compose-peer-vm1.yaml"
}

function changeHostnameVM2() {
    HOSTNAME=${VM2_HOSTNAME}
    sed -i "s/node.hostname ==/node.hostname == $HOSTNAME/g" "compose/compose-couch-vm2.yaml"
    sed -i "s/node.hostname ==/node.hostname == $HOSTNAME/g" "compose/compose-peer-vm2.yaml"
}

function changeHostnameVM3() {
    HOSTNAME=${VM3_HOSTNAME}
    sed -i "s/node.hostname ==/node.hostname == $HOSTNAME/g" "compose/compose-couch-vm3.yaml"
    sed -i "s/node.hostname ==/node.hostname == $HOSTNAME/g" "compose/compose-peer-vm3.yaml"
}

changeHostnameVM1
changeHostnameVM2
changeHostnameVM3
