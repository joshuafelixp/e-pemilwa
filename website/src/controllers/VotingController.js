import { authenticateVoter } from "../services/FabricAutService.js";
import {
  changeVoteAccess,
  createVote,
  getAllCandidates,
} from "../services/VotingService.js";

export const getVoting = async (req, res) => {
  try {
    const voteAccess = await authenticateVoter(req.decoded.nim);
    if (voteAccess == true) {
      const candidatesData = await getAllCandidates();
      return res.render("voting", {
        layout: "layouts/main_layout",
        title: "E-Pemilwa",
        customCSS: "/css/voting.css",
        candidates: candidatesData,
      });
    } else {
      req.flash("error", "Anda sudah memilih!");
      await changeVoteAccess(req.decoded.nim);
      return res.status(403).redirect("/vote");
    }
  } catch (error) {
    req.flash("error", "Terjadi kesalahan, silahkan coba kembali!");
    return res.status(500).redirect("/vote");
  }
};

export const postVoting = async (req, res) => {
  try {
    const voteAccess = await authenticateVoter(req.decoded.nim);
    if (voteAccess == true) {
      await createVote(req.decoded.nim, req.body.vote);
      req.flash("success", "Berhasil Vote");
      return res.status(201).redirect("/dashboard");
    } else {
      req.flash("error", "Anda sudah memilih!");
      return res.status(403).redirect("/vote");
    }
  } catch (error) {
    req.flash("error", "Gagal Vote");
    return res.status(500).redirect("/vote");
  }
};
