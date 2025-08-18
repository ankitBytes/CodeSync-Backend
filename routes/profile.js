import express from "express";
import {
  UpdateData,
  FetchProfile,
} from "../controller/profileDetail.controller.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.put("/update_profile/:id", upload.single("image"), UpdateData);
router.get("/profile/:id", FetchProfile);

export default router;
