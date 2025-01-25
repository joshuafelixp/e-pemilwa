import voteModel from "../models/Vote.js";
import voterModel from "../models/Voter.js";
import candidateModel from "../models/Candidate.js";
import adminModel from "../models/Admin.js";

export const getDashboardData = async () => {
  try {
    const [voteCount, voterCount, candidateCount, adminCount] =
      await Promise.all([
        voteModel.countDocuments(),
        voterModel.countDocuments(),
        candidateModel.countDocuments(),
        adminModel.countDocuments(),
      ]);
    const candidatesData = await candidateModel.aggregate([
      {
        $lookup: {
          from: "votes",
          localField: "candidateNumber",
          foreignField: "voteCandidate",
          as: "votes",
        },
      },
      {
        $project: {
          candidateNumber: 1,
          presidentName: 1,
          vpresidentName: 1,
          candidateImage: 1,
          totalVotes: { $size: "$votes" },
        },
      },
    ]);

    return {
      voteCount,
      voterCount,
      candidateCount,
      adminCount,
      candidatesData,
    };
  } catch (error) {
    throw error;
  }
};

export const getAccountData = async (nimData) => {
  try {
    const account = await voterModel.findOne({ nim: nimData });
    return account;
  } catch (error) {
    throw error;
  }
};
