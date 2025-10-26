/* This JavaScript code snippet is a module that handles user authentication and authorization using
Passport.js for authentication strategies like Google OAuth and local authentication, JWT for token
generation and verification, and a User model for interacting with user data. */
import passport from "passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import UserProfile from "../models/profile.model.js";
import Session from "../models/session.model.js";

// Environment check
const isProduction = process.env.NODE_ENV === "production";

// Input validation helper
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const google = (req, res, next) => {
  try {
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })(req, res, next);
  } catch (error) {
    console.error("Google Auth Error:", error.message);
    return res
      .status(500)
      .json({ message: "Authentication initiation failed" });
  }
};

export const googleCallback = (req, res, next) => {
  try {
    passport.authenticate(
      "google",
      { failureRedirect: process.env.CLIENT_URL + "/login", session: false },
      (err, user) => {
        try {
          if (err || !user) {
            console.error("Google Callback Error:", err?.message || "No user");
            return res.redirect(process.env.CLIENT_URL + "/login");
          }

          const payload = {
            id: user._id,
            name: user.displayName,
            email: user.email,
            image: user.image,
          };

          const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "24h", // Reduced from 50h to 24h for security
          });

          // Set the token as a cookie
          // res.cookie("token", token, {
          //   httpOnly: true,
          //   secure: true,
          //   sameSite: "None",
          //   maxAge: 24 * 60 * 60 * 1000,
          // });

          const redirectUrl =
            process.env.CLIENT_URL + `/success?token=${token}`;

          return res.redirect(redirectUrl);
        } catch (innerErr) {
          console.error("Token Generation Error:", innerErr.message);
          return res.status(500).json({ message: "Internal server error" });
        }
      }
    )(req, res, next);
  } catch (error) {
    console.error("Callback Outer Error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res, next) => {
  try {
    req.logout((err) => {
      if (err) {
        console.error("Logout Error:", err.message);
        return next(err);
      }

      res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "Strict" : "Lax",
      });

      return res.status(200).json({ message: "Logged out successfully" });
    });
  } catch (error) {
    console.error("Logout Catch Error:", error.message);
    return res.status(500).json({ message: "Logout failed" });
  }
};

export const current_user = (req, res) => {
  try {
    if (req.user) {
      return res.status(200).json(req.user);
    } else {
      return res.status(401).json({ message: "User not authenticated" });
    }
  } catch (error) {
    console.error("Current User Error:", error.message);
    return res.status(500).json({ message: "Failed to get user info" });
  }
};

export const Login = async (req, res, next) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!validatePassword(password)) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      console.log("Raw user found:", !!user, typeof user, user?._id);
      console.log("User: ", user);

      if (err || !user) {
        console.error(
          "Login Error authController:",
          err?.message || "No user found"
        );
        return res
          .status(401)
          .json({ message: info?.message || "Login failed" });
      }

      const payload = {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      // res.cookie("token", token, {
      //   httpOnly: true,
      //   secure: isProduction,
      //   sameSite: isProduction ? "Strict" : "Lax",
      //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      // });

      const redirectUrl = process.env.CLIENT_URL + `/success?token=${token}`;

      return res.status(200).json({ message: "Login successful", redirectUrl });
    })(req, res, next);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Login failed", error: error.message });
  }
};

export const Signup = async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!validatePassword(password)) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const username = email.split("@")[0];

    const newUser = new User({
      email,
      password,
      provider: "local",
      username,
      displayName: username,
    });

    await newUser.save();

    const payload = {
      id: newUser._id,
      email: newUser.email,
    };

    try {
      // Create Profile
      await UserProfile.create({
        userId: newUser._id,
        name: newUser.email.split("@")[0],
        username: newUser.email.split("@")[0],
      });

      // Create Initial Session
      await Session.create({
        userId: newUser._id,
        title: "",
        description: "",
        aiSummary: "",
      });
    } catch (err) {
      // Rollback: delete user & profile if session creation fails
      await User.deleteOne({ _id: newUser._id });
      await UserProfile.deleteOne({ userId: newUser._id });
      return res.status(500).json({ message: "Failed to create user profile" });
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const redirectUrl = process.env.CLIENT_URL + `/success?token=${token}`;

    return res.status(200).json({ message: "Signup successful", redirectUrl });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Signup failed", error: error.message });
  }
};

export const VerifyUser = async (req, res, next) => {
  const token =
    req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const UpdatePassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
