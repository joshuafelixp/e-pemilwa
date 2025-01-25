import "dotenv/config";
import grpc from "@grpc/grpc-js";
import { connect, hash, signers } from "@hyperledger/fabric-gateway";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { TextDecoder } from "node:util";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const utf8Decoder = new TextDecoder();

const gatewayOptions = {
  channelName: process.env.CH1_NAME,
  chaincodeName: process.env.CH1_CC,
  mspId: process.env.CH1_MSP,
  cryptoPath: process.env.CH1_CRYPTO, // Path to crypto materials.
  keyDirectoryPath: process.env.CH1_KEY, // Path to user private key directory.
  certDirectoryPath: process.env.CH1_CERT, // Path to user certificate directory.
  tlsCertPath: process.env.CH1_TLS, // Path to peer tls certificate.
  peerEndpoint: process.env.CH1_PEER, // Gateway peer endpoint.
  peerHostAlias: process.env.CH1_HOST, // Gateway peer SSL host name override.
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

export async function authenticateVoter(nim) {
  try {
    const data = `${nim}true`;
    const hash = await createHash(data);
    console.log("Call chaincode AuthenticateVoter on channel autentikasich");
    const resultBytes = await executeEvaluateTransaction("AuthenticateVoter", [
      hash,
    ]);
    const voteAccess = utf8Decoder.decode(resultBytes);
    console.log('Success execute chaincode AuthenticateVoter on channel autentikasich')
    console.log(
      voteAccess === "true" ? "Voter granted access" : "Voter denied access"
    );
    return voteAccess === "true";
  } catch (error) {
    console.error(error.message)
    throw error
  }
}

export async function registerVoter(nim) {
  try {
    const data = `${nim}true`;
    const hash = await createHash(data);
    const timestamp = new Date().toISOString();
    console.log("Call chaincode RegisterVoter on channel autentikasich");
    await executeSubmitTransaction("RegisterVoter", [hash, timestamp]);
    console.log('Success execute chaincode RegisterVoter on channel autentikasich')
    console.log("Success registering voter on ledger");
  } catch (error) {
    console.error(error.message)
    throw error
  }
}

export async function getAllAssetAut() {
  try {
    console.log("Call chaincode GetAllAssets on channel autentikasich");
    const resultBytes = await executeEvaluateTransaction("GetAllAssets");
    console.log('Success execute chaincode GetAllAssets on channel autentikasich')
    return JSON.parse(utf8Decoder.decode(resultBytes));
  } catch (error) {
    console.error(error.message)
    throw error
  }
}

export const readAssetAut = async (voterHash) => {
  try {
    console.log("Call chaincode ReadAsset on channel autentikasich");
    const resultBytes = await executeEvaluateTransaction("ReadAsset", [voterHash]);
    console.log('Success execute chaincode ReadAsset on channel autentikasich')
    return JSON.parse(utf8Decoder.decode(resultBytes));
  } catch (error) {
    console.error(error.message)
    return {}
  }
};

export async function getAssetHistoryAut(voterHash) {
  try {
    console.log("Call chaincode GetAssetHistory on channel autentikasich");
    const resultBytes = await executeEvaluateTransaction("GetAssetHistory", [
      voterHash,
    ]);
    console.log('Success execute chaincode GetAssetHistory on channel autentikasich')
    return JSON.parse(utf8Decoder.decode(resultBytes));
  } catch (error) {
    printError("getAssetHistoryAut", error);
    console.error(error.message)
    throw error
  }
}
