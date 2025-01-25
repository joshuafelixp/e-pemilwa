import {
  getDashboardDataAdmin,
  getResultData,
  getVoteIntegrity,
  loginAdmin,
  recapitulate,
} from "../services/AdminService.js";

import url from "url";

export const getAdminLogin = (req, res) => {
  return res.render("admin/admin_login", {
    layout: "layouts/main_layout",
    title: "E-Pemilwa",
    customCSS: "/css/login.css",
    successMessage: req.flash("success"),
    errorMessage: req.flash("error"),
  });
};

export const postAdminLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400);
    return console.log("Masukkan kredensial yang valid!");
  }
  try {
    const admin = await loginAdmin(username, password);
    res.cookie("jwt", admin, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    req.flash("success", "Berhasil Masuk");
    return res.status(200).redirect("/admin");
  } catch (error) {
    req.flash("error", error.message);
    return res.status(400).redirect("/admin/login");
  }
};

export const getAdmin = async (req, res) => {
  try {
    const dashboardData = await getDashboardDataAdmin();
    return res.render("admin/admin_dashboard", {
      layout: "layouts/dashboard_layout",
      title: "E-Pemilwa",
      customCSS: "/css/dashboard.css",
      successMessage: req.flash("success"),
      errorMessage: req.flash("error"),
      dashboard: dashboardData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const getManageAdmin = (req, res) => {
  return res.render("admin/admin_manage_admin", {
    layout: "layouts/dashboard_layout",
    title: "E-Pemilwa",
    customCSS: "/css/manage_admin.css",
  });
};

export const getAddAdmin = (req, res) => {
  return res.render("admin/admin_add_admin", {
    layout: "layouts/main_layout",
    title: "E-Pemilwa",
    customCSS: "/css/add_admin.css",
  });
};

export const getAdminResult = async (req, res) => {
  try {
    const resultData = await getResultData();
    return res.render("admin/admin_result", {
      layout: "layouts/dashboard_layout",
      title: "E-Pemilwa",
      customCSS: "/css/admin_result.css",
      result: resultData,
      successMessage: req.flash("success"),
      errorMessage: req.flash("error"),
    });
  } catch (error) {
    console.log(error.message);
    req.flash("error", "Terjadi Kesalahan! Coba refresh halaman.");
    return res.render("admin/admin_result", {
      layout: "layouts/dashboard_layout",
      title: "E-Pemilwa",
      customCSS: "/css/admin_result.css",
      result: {
        candidatesData: {},
        voteCountDb: 0,
        voteCountLedger: 0,
        voteCountValid: 0,
        voteCountInvalid: 0,
        invalidVotes: {},
        recapTime: {}
      },
      successMessage: req.flash("success"),
      errorMessage: req.flash("error"),
    });
  }
};

export const postAdminResult = async (req, res) => {
  try {
    await recapitulate();
    req.flash("success", "Berhasil rekap suara.");
    return res.status(200).redirect("/admin/result");
  } catch (error) {
    req.flash("error", "Terjadi kesalahaan saat merekap suara.");
    console.log(error.message);
    return res.redirect("/admin/result");
  }
};

export const getAdminIntegrity = async (req, res) => {
  try {
    const q = url.parse(req.url, true);
    const voteID = q.query.voteID
    let resultData = {
      voteID: "",
      voteHashDb: "",
      voteHashLedger: "",
      historyVotes: {},
    };
    if (voteID) {
      resultData = await getVoteIntegrity(voteID);
    }
    return res.render("admin/admin_integrity", {
      layout: "layouts/dashboard_layout",
      title: "E-Pemilwa",
      customCSS: "/css/integrity.css",
      result: resultData,
      successMessage: req.flash("success"),
      errorMessage: req.flash("error"),
    });
  } catch (error) {
    // console.log(error.message);
    req.flash("error", error.message)
    return res.redirect("/admin/integrity");
  }
};

export const getAdminLogout = (req, res) => {
  res.clearCookie("jwt");
  req.flash("success", "Berhasil Keluar");
  return res.status(200).redirect("/");
};
