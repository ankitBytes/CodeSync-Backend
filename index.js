import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import mongoose from "mongoose";
import "./config/passport.js";
import cookieParser from "cookie-parser";
import "./config/cloudinary.js"; // Ensure cloudinary is configured
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import MongoStore from "connect-mongo";

// Routes
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import sessionRoutes from "./routes/session.route.js";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;

// ✅ Validate required environment variables
const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "SESSION_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "CLIENT_URL"
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  } else {
    console.log(`✅ Found environment variable: ${envVar}`);
  }
}

// ✅ CORS configuration
app.use(
  cors({
    origin: isProduction ? process.env.CLIENT_URL : "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow serving resources to different origins
  })
);

// ✅ General rate limiting (not for auth)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 200 : 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// ✅ Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 24 * 60 * 60, // 1 day
    }),
    cookie: {
      httpOnly: true,
      secure: isProduction, // true only in production (HTTPS)
      sameSite: isProduction ? "None" : "Lax", // "None" for cross-domain
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// ✅ Middleware setup
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/user", profileRoutes);
app.use("/session", sessionRoutes);

// ✅ Root route
app.get("/", (req, res) => {
  res.send("Welcome to the CodeSync API");
});

// ✅ Connect to MongoDB first, then start the server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
