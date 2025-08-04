import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import authRoutes from "./routes/auth.js";
import passport from "passport";
import cors from "cors";
import mongoose from "mongoose";
import "./config/passport.js";
import cookieParser from "cookie-parser";
import { sendEmail } from "./utils/mailer.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173", // or http://localhost:5173 if not https
    credentials: true,
  })
);

// ✅ Use only express-session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_session_secret",
    resave: false,
    saveUninitialized: false,
    // Optional: add store if needed (like MongoStore)
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the CodeSync API");
})

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
