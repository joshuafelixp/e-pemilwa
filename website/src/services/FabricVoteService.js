import "dotenv/config";
import grpc from "@grpc/grpc-js";
import { connect, hash, signers } from "@hyperledger/fabric-gateway";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { TextDecoder } from "node:util";
import { fileURLToPath } from "url";

import voteModel from "../models/Vote.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const utf8Decoder = new TextDecoder();

const gatewayOptions = {
  channelName: process.env.CH2_NAME,
  chaincodeName: process.env.CH2_CC,
  mspId: process.env.CH2_MSP,
  cryptoPath: process.env.CH2_CRYPTO, // Path to crypto materials.
  keyDirectoryPath: process.env.CH2_KEY, // Path to user private key directory.
  certDirectoryPath: process.env.CH2_CERT, // Path to user certificate directory.
  tlsCertPath: process.env.CH2_TLS, // Path to peer tls certificate.
  peerEndpoint: process.env.CH2_PEER, // Gateway peer endpoint.
  peerHostAlias: process.env.CH2_HOST, // Gateway peer SSL host name override.
};

function printError(context, error) {
  console.error(`******** FAILED in ${context}: ${error.message}`);
}

async function getFirstFilePath(dirPath) {
  const files = await fs.readdir(dirPath);
  if (!files.length) throw new Error(`No files found in directory: ${dirPath}`);
  return path.join(dirPath, files[0]);
}

async function createHash(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

async function newGrpcConnection() {
  const tlsRootCert = await fs.readFile(gatewayOptions.tlsCertPath);
  const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
  return new grpc.Client(gatewayOptions.peerEndpoint, tlsCredentials, {
    "grpc.ssl_target_name_override": gatewayOptions.peerHostAlias,
  });
}

async function newIdentity() {
  const certPath = await getFirstFilePath(gatewayOptions.certDirectoryPath);
  const credentials = await fs.readFile(certPath);
  return { mspId: gatewayOptions.mspId, credentials };
}

async function newSigner() {
  const keyPath = await getFirstFilePath(gatewayOptions.keyDirectoryPath);
  const privateKeyPem = await fs.readFile(keyPath);
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  return signers.newPrivateKeySigner(privateKey);
}

async function setupGateway() {
  const client = await newGrpcConnection();
  const gateway = connect({
    client,
    identity: await newIdentity(),
    signer: await newSigner(),
    hash: hash.sha256,
    evaluateOptions: () => ({ deadline: Date.now() + 60000 }),
    endorseOptions: () => ({ deadline: Date.now() + 60000 }),
    submitOptions: () => ({ deadline: Date.now() + 60000 }),
    commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
  });
  return { client, gateway };
}

async function executeEvaluateTransaction(transactionName, args = []) {
  const { client, gateway } = await setupGateway();
  try {
    const network = gateway.getNetwork(gatewayOptions.channelName);
    const contract = network.getContract(gatewayOptions.chaincodeName);
    return await contract.evaluateTransaction(transactionName, ...args);
  } catch (error) {
    process.exitCode = 1;
    printError(transactionName, error);
    throw error
  } finally {
    gateway.close();
    client.close();
  }
}

async function executeSubmitTransaction(transactionName, args = []) {
  const { client, gateway } = await setupGateway();
  try {
    const network = gateway.getNetwork(gatewayOptions.channelName);
    const contract = network.getContract(gatewayOptions.chaincodeName);
    return await contract.submitTransaction(transactionName, ...args);
  } catch (error) {
    process.exitCode = 1;
    printError(transactionName, error);
    throw error
  } finally {
    gateway.close();
    client.close();
  }
}

export const createVoteLedger = async (voteId) => {
  try {
    const voteData = await voteModel.findOne({ voteID: voteId });
    const data = `${voteData.voteID}${voteData.voteCandidate}${voteData.createdTime}`;
    const hash = await createHash(data);
    const timestamp = new Date().toISOString();
    console.log("Call chaincode CreateVote on channel votingch");
    await executeSubmitTransaction("CreateVote", [
      voteData.voteID,
      hash,
      timestamp,
    ]);
    console.log('Success execute chaincode CreateVote on channel votingch')
    console.log("Success create vote on ledger");
  } catch (error) {
    console.error(error.message)
    throw error
  }
};

export const getAllAssetVot = async () => {
  try {
    console.log("Call chaincode GetAllAssets on channel votingch");
    const resultBytes = await executeEvaluateTransaction("GetAllAssets");
    console.log('Success execute chaincode GetAllAssets on channel votingch')
    return JSON.parse(utf8Decoder.decode(resultBytes));
  } catch (error) {
    console.error(error.message)
    throw error
  }
};

export const readAssetVot = async (voteID) => {
  try {
    console.log("Call chaincode ReadAsset on channel votingch");
    const resultBytes = await executeEvaluateTransaction("ReadAsset", [voteID]);
    console.log('Success execute chaincode ReadAsset on channel votingch')
    return JSON.parse(utf8Decoder.decode(resultBytes));
  } catch (error) {
    console.error(error.message)
    return {}
  }
};

export const getAssetHistoryVot = async (voteID) => {
  try {
    console.log("Call chaincode GetAssetHistory on channel votingch");
    const resultBytes = await executeEvaluateTransaction("GetAssetHistory", [
      voteID,
    ]);
    console.log('Success execute chaincode GetAssetHistory on channel votingch')
    return JSON.parse(utf8Decoder.decode(resultBytes));
  } catch (error) {
    printError("getAssetHistoryAut", error);
    console.error(error.message)
    throw error
  }
};
