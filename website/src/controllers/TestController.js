import {
  getAllAssetAut,
  getAssetHistoryAut,
  readAssetAut,
} from "../services/FabricAutService.js";
import {
  getAllAssetVot,
  getAssetHistoryVot,
} from "../services/FabricVoteService.js";

import url from "url";
import crypto from "node:crypto";
import voteModel from "../models/Vote.js";
import voterModel from "../models/Voter.js";

export const getTest = async (req, res) => {
  try {
    //Cek data voters
    const nim = 195150200111046
    const voterDB = await voterModel.findOne({nim: nim})
    const voterHash = crypto
    .createHash("sha256")
    .update(`${nim}true`)
    .digest("hex");
    // const voterHash = "8df00c57e137eb7301ac0e47a57bc1a6cb4b6b12825fb56031e863375f5051dd";
    // const dataAut = await getAllAssetAut();
    // const historyAut = await getAssetHistoryAut(voterHash);
    const assetAut = await readAssetAut(voterHash);

    //Cek data votes
    // const voteID = "bc5e223b-5ca1-4cf1-a1d4-82374315246c";
    // const dataVote = await getAllAssetVot();
    // const historyVot = await getAssetHistoryVot(voteID);

    const response = {
      voterDB: voterDB,
      voterHash: voterHash,
      // isiLedgerAutentikasi: dataAut,
      // autHistory: historyAut,
      ledgerAutentikasi: assetAut,
      // isiLedgerVoting: dataVote,
      // votHistory: historyVot,
    };
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};

// export const getTest2 = async (req, res) => {
//   try {
//     const q = url.parse(req.url, true);
//     const voteID = q.query.voteID
//     res.send(voteID);
//   } catch (error) {
//     console.log(error.message);
//   }
// };
