import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // links to User collection
    required: true
  },
  title: { type: String },
  description: { type: String },
  aiSummary: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);