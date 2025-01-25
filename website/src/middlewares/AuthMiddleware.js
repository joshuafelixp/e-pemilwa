import "dotenv/config";
import jwt from "jsonwebtoken";
import { checkRole } from "../services/AuthService.js";

const secret = process.env.SECRET;

const verifyToken = (token, loginUrl, role, req, res, next) => {
  if (!token) {
    return res.status(401).redirect(loginUrl);
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).redirect(loginUrl);
    }

    const roleCheck = checkRole(decoded);
    if (roleCheck !== role) {
      const redirectUrl = roleCheck === "admin" ? "/admin/login" : "/login";
      return res.status(401).redirect(redirectUrl);
    }

    req.decoded = decoded;
    return next();
  });
};

// Middleware auth untuk pengguna umum
export const auth = (req, res, next) => {
  const token = req.cookies.jwt;
  return verifyToken(token, "/login", "voter", req, res, next);
};

// Middleware auth untuk admin
export const authAdmin = (req, res, next) => {
  const token = req.cookies.jwt;
  verifyToken(token, "/admin/login", "admin", req, res, next);
};

// Middleware untuk mengecek login
export const isLogin = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return next();
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return next();
    }

    const role = checkRole(decoded);
    const redirectUrl = role === "admin" ? "/admin" : "/dashboard";
    req.decoded = decoded;
    return res.status(302).redirect(redirectUrl);
  });
};
