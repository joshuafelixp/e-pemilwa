import express from "express";
import { isLogin } from "../middlewares/AuthMiddleware.js";
import { getHome } from "../controllers/HomeController.js";

const router = express.Router();

router.get("/", isLogin, getHome);

export default router;
