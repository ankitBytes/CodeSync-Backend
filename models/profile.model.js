import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    profilePicture: {
        type: String,
        default: ""
    },
    name: {
        type: String,
        required: true,
        default: ""
    },
    username: {
        type: String,
        required: true,
        unique: true,
        default: ""
    },
    designation: {
        type: String,
        default: ""
    },
    workingAt: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    linkedin: {
        type: String,
        default: ""
    },
    skills: {
        type: [String],
        default: []
    },
    about: {
        type: String,
        default: ""
    }
});

export default mongoose.model("UserProfile", profileSchema);