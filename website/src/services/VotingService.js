import { isLoadBalancerNameRegistered } from "@grpc/grpc-js/build/src/load-balancer.js";
import candidateModel from "../models/Candidate.js";
import voteModel from "../models/Vote.js";
import voterModel from "../models/Voter.js";
import { registerVoter } from "./FabricAutService.js";
import { createVoteLedger } from "./FabricVoteService.js";
import { v4 as uuidv4 } from "uuid";

export const getAllCandidates = async () => {
  try {
    const candidates = await candidateModel.find();
    return candidates;
  } catch (error) {
    throw error;
  }
};

export const createVote = async (nim, vote) => {
  try {
    const voteId = uuidv4();
    await voteModel.create({
      voteID: voteId,
      voteCandidate: vote,
    });
    await createVoteLedger(voteId);
    await registerVoter(nim)
    const timestamp = new Date().toString();
    await voterModel.updateOne(
      { nim: nim },
      { $set: { hasVoted : true, voteTime : timestamp } }
    );
  } catch (error) {
    throw error;
  }
};

export const changeVoteAccess = async (nim) => {
  return await voterModel.findOneAndUpdate({nim: nim},{hasVoted: true})  
}
