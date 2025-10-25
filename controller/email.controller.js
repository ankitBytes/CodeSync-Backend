/**
 * The above code defines functions to send and verify OTPs using email and generate JWT tokens for
 * authentication.
 * @param req - The `req` parameter in the functions `SendOtp` and `VerifyOtp` represents the request
 * object in Express.js. It contains information about the HTTP request that triggered the function,
 * such as request headers, parameters, body, etc. In this case, `req.body` is used
 * @param res - The `res` parameter in the code snippets you provided stands for the response object in
 * Express.js. It is used to send a response back to the client making the HTTP request. The response
 * object (`res`) has methods like `res.status()`, `res.json()`, and `res.send()`
 * @returns The `SendOtp` function sends an OTP (One Time Password) to the provided email address. It
 * generates a random OTP, saves it in the database with an expiration time of 5 minutes, and sends an
 * email containing the OTP to the user. The function returns a JSON response with a success message if
 * the OTP is sent successfully, or an error message if there was an issue.
 */
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/mailer.js";
import Otp from "../models/Otp.js";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

export const SendOtp = async (req, res) => {
  const { email, purpose } = req.body;
  console.log(`Sending OTP to ${email}`);

  try {
    if (purpose === "signup") {
      const user = await User.findOne({ email });
      if (user) {
        return res.status(409).json({ message: "User already exists" });
      }
    }
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

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return res
      .status(200)
      .json({ message: "OTP verified successfully", token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error verifying OTP", error: error });
  }
};
