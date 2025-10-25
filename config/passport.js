import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import UserProfile from "../models/profile.model.js";
import Session from "../models/session.model.js";
import dotenv from "dotenv";

dotenv.config();
const isProduction = process.env.NODE_ENV === "production";

console.log("Passport file initiated");


// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: isProduction
        ? process.env.GOOGLE_CALLBACK_URL
        : "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) return done(null, existingUser);

        // Generate a username from email or displayName
        const baseUsername = profile.emails[0].value.split("@")[0];
        const usernameExists = await User.findOne({ username: baseUsername });
        const username = usernameExists
          ? `${baseUsername}_${Math.floor(Math.random() * 1000)}`
          : baseUsername;

        const newUser = await User.create({
          googleId: profile.id,
          displayName: profile.displayName,
          username, // <-- important
          email: profile.emails[0].value.toLowerCase(),
          image: profile.photos[0].value,
          provider: "google",
        });

        await UserProfile.create({
          userId: newUser._id,
          name: newUser.displayName,
          username: newUser.username,
        });

        await Session.create({
          userId: newUser._id,
          title: "",
          description: "",
          aiSummary: "",
        });

        return done(null, newUser);
      } catch (err) {
        console.error("Google signup error:", err);
        return done(err, null);
      }
    }
  )
);

// Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        console.log("Login Attempt:", email, user);
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        if (!user.password) return done(null, false, { message: "Use Google Login for this account" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect Password" });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
  User.findById(id).then((user) => done(null, user))
);


