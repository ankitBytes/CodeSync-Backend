import express from "express";
import { createSession } from "../controller/session.controller.js";
import AuthMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-session", AuthMiddleware, createSession);
router.patch("/create-session", AuthMiddleware, createSession);

export default router;