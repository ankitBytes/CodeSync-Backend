import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  googleId: { type: String },
  displayName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String },
  provider: { type: String, default: "local" },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);
