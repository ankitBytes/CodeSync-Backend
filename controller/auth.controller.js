import passport from "passport";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

// Environment check
const isProduction = process.env.NODE_ENV === "production";

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
      { failureRedirect: "/login", session: false },
      (err, user) => {
        try {
          if (err || !user) {
            console.error("Google Callback Error:", err?.message || "No user");
            return res.redirect("/login");
          }

          const payload = {
            id: user._id,
            name: user.displayName,
            email: user.email,
            image: user.image,
          };

          const token = jwt.sign(payload, process.env.JWT, {
            expiresIn: "50h",
          });

          // Set the token as a cookie
          res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "Strict" : "Lax",
            maxAge: 50 * 60 * 60 * 1000, // 50 hours
          });

          return res.redirect("http://localhost:5173/"); // safer redirect
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
        secure: isProduction, // ❗ Only if you're using HTTPS
        sameSite: isProduction ? "Strict" : "Lax", // Match how it was set
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
  try {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err || !user) {
        console.error("Login Error:", err?.message || "No user found");
        return res.redirect("/login");
      }

      const paylod = {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
      };

      const token = jwt.sign(paylod, process.env.JWT, { expiresIn: "7d" });

      res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "Strict" : "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.redirect("http://localhost:5173/"); // safer redirect
    })(req, res, next);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Login failed", error: error.message });
  }
};

export const Signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.redirect("/login");

    const newUser = new User({
      email,
      password,
      provider: "local",
    });

    await newUser.save();

    const payload = {
      id: newUser._id,
      email: newUser.email,
    };

    const token = jwt.sign(payload, process.env.JWT, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "Strict" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.redirect("http://localhost:5173/"); // safer redirect
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Signup failed", error: error.message });
  }
};

export const VerifyUser = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT);
    req.user = decoded;
    next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
