import "dotenv/config";
import adminModel from "../models/Admin.js";
import candidateModel from "../models/Candidate.js";
import voteModel from "../models/Vote.js";
import voterModel from "../models/Voter.js";
import resultModel from "../models/Result.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import {
  getAllAssetVot,
  getAssetHistoryVot,
  readAssetVot,
} from "./FabricVoteService.js";
const secret = process.env.SECRET;

export const loginAdmin = async (usernameData, passwordData) => {
  try {
    const registeredAdmin = await adminModel.findOne({
      username: usernameData,
    });
    if (!registeredAdmin) {
      throw new Error("Username atau Password salah!");
    }
    const isPasswordValid = bcrypt.compareSync(
      passwordData,
      registeredAdmin.password
    );
    if (!isPasswordValid) {
      throw new Error("Username atau Password salah!");
    }
    const token = jwt.sign({ username: registeredAdmin.username }, secret, {
      expiresIn: "1d",
    });
    return token;
  } catch (error) {
    throw error;
  }
};

export const getDashboardDataAdmin = async () => {
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

export const getResultData = async () => {
  try {
    const recapTime = await resultModel.findById("recapTime");
    const voteCountDb = await voteModel.countDocuments();

    if (!recapTime || !recapTime.lastRecapTime || recapTime.lastTotalVotes != voteCountDb) {
      console.log("Data belum direkap!");
      return {
        candidatesData: {},
        voteCountDb: 0,
        voteCountLedger: 0,
        voteCountValid: 0,
        voteCountInvalid: 0,
        invalidVotes: {},
        recapTime: {},
      };
    }

    const candidatesData = await candidateModel.aggregate([
      // Gabungkan data kandidat dengan data suara
      {
        $lookup: {
          from: "votes", // Nama koleksi vote
          localField: "candidateNumber", // Field di Candidate
          foreignField: "voteCandidate", // Field di Vote
          as: "votes",
        },
      },
      // Filter suara yang valid (isValid: true)
      {
        $addFields: {
          validVotes: {
            $filter: {
              input: "$votes",
              as: "vote",
              cond: { $eq: ["$$vote.isValid", true] },
            },
          },
        },
      },
      // Hitung jumlah suara yang valid
      {
        $addFields: {
          totalVotes: { $size: "$validVotes" },
        },
      },
      // Hapus field "votes" yang sudah tidak diperlukan
      {
        $project: {
          presidentName: 1,
          vpresidentName: 1,
          candidateNumber: 1,
          candidateImage: 1,
          totalVotes: 1,
        },
      },
    ]);

    const [voteCountLedger, voteCountValid, voteCountInvalid] =
      await Promise.all([
        getAllAssetVot().then((data) => {
          if (!data) {
            throw error;
          }
          return data.length;
        }),
        voteModel.countDocuments({ isValid: true }),
        voteModel.countDocuments({ isValid: false }),
      ]);

    const invalidVotes = await voteModel.find({ isValid: false }).lean();

    return {
      candidatesData,
      voteCountDb,
      voteCountLedger,
      voteCountValid,
      voteCountInvalid,
      invalidVotes,
      recapTime,
    };
  } catch (error) {
    console.error("Error saat mengambil data: ", error);
    throw error;
  }
};

export const recapitulate = async () => {
  try {
    //mengambil seluruh data suara di db
    const voteDB = await voteModel.find({});
    //menghitung jumlah susara di db
    const voteCount = await voteModel.countDocuments()
    //melakukan perulangan untuk memvalidasi suara
    for (const vote of voteDB) {
      //membuat hash suara
      const mongoHash = crypto
        .createHash("sha256")
        .update(`${vote.voteID}${vote.voteCandidate}${vote.createdTime}`)
        .digest("hex");
      //memanggil fungsi ReadAssetVot pada cc voting
      const voteLedger = await readAssetVot(vote.voteID);
      // ganti isvalid false jika tidak ada di ledger, sebaliknya
      if (!voteLedger) {
        await voteModel.updateOne(
          { voteID: vote.voteID },
          { $set: { isValid: false } }
        );
        console.log(voteLedger)
        console.log(`Tidak ada voteID ${vote.voteID} di Ledger`);
      } else {
        const isValid = mongoHash === voteLedger.VoteHash;
        await voteModel.updateOne(
          { voteID: vote.voteID },
          { $set: { isValid } }
        );
      }
      console.log("Success recapitulate all vote");
      const timestamp = new Date();
      await resultModel.findOneAndUpdate(
        { _id: "recapTime" },
        { $set: { lastRecapTime: timestamp, lastTotalVotes: voteCount} },
        { upsert: true }
      );
      console.log(`Recap time updated to: ${timestamp}`);
    }
  } catch (error) {
    throw error
  }
};

export const getVoteIntegrity = async (voteID) => {
  try {
    const vote = await voteModel.findOne({ voteID: voteID });
    if(!vote){
      console.error("Id suara tidak terdapat di database!")
      throw new Error("Id suara tidak terdapat di database!");  
    }
    const voteHashDb = crypto
      .createHash("sha256")
      .update(`${vote.voteID}${vote.voteCandidate}${vote.createdTime}`)
      .digest("hex");

    const voteLedger = await readAssetVot(voteID);
    if(voteLedger.length < 1){
      console.error("Id suara tidak terdapat di ledger!")
    }
    const voteHashLedger = voteLedger.VoteHash;

    const historyVotes = await getAssetHistoryVot(voteID);

    return {
      voteID,
      voteHashDb,
      voteHashLedger,
      historyVotes,
    };
  } catch (error) {
    throw error;
  }
};
