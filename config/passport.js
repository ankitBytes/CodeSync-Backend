import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import UserProfile from "../models/profile.model.js";
import Session from "../models/session.model.js";
import dotenv from "dotenv";

dotenv.config();

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // If user already exists, just log them in
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) return done(null, existingUser);

        const newUser = await User.create({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          image: profile.photos[0].value,
        });

        try {
          await UserProfile.create({
            userId: newUser._id,
            name: newUser.email.split("@")[0],
            username: newUser.email.split("@")[0],
          });

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
          return done(err, null);
        }

        return done(null, newUser);
      } catch (err) {
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
        if (!user || !user.password) {
          return done(null, false, { message: "User not found" });
        }

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
