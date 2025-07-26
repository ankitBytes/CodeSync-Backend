import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, Profile, done) => {
      const existingUser = await User.findOne({ googleId: Profile.id });

      if (existingUser) return done(null, existingUser);

      const newUser = await User.create({
        googleId: Profile.id,
        displayName: Profile.displayName,
        email: Profile.emails[0].value,
        image: Profile.photos[0].value,
      });

      done(null, newUser);
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
  User.findById(id).then((user) => done(null, user))
);
