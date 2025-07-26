import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: String,
  displayName: String,
  email: String,
  image: String,
})

export default mongoose.model('User', userSchema);