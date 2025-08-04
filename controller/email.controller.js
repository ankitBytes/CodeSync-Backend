import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/mailer.js";
import Otp from "../models/Otp.js";
import dotenv from "dotenv";
dotenv.config();

export const SendOtp = async (req, res) => {
  const { email } = req.body;
  console.log(`Sending OTP to ${email}`);
  
  try {
    const otp = crypto.randomInt(100000, 999999).toString();

    await Otp.deleteMany({ email });
    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendEmail(
      email,
      "OTP for CodeSync",
      `<h2>Your OTP is: ${otp}</h2><p>It will expire in 5 minutes.</p>`
    );

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error sending OTP", error: error.message });
  }
};

export const VerifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await Otp.findOne({ email, otp });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await Otp.deleteMany({ email });

    const token = jwt.sign({ email }, process.env.JWT, { expiresIn: "7d" });
    return res
      .status(200)
      .json({ message: "OTP verified successfully", token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error verifying OTP", error: error.message });
  }
};
