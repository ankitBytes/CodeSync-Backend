// profile.controller.js
import UserProfile from "../models/profile.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export const UpdateData = async (req, res) => {
  try {
    const userId = req.params.id;
    const incomingData = req.body;

    const existingUser = await UserProfile.findOne({ userId });
    if (!existingUser) {
      return res.status(404).json({ message: "Profile not found" });
    }

    let updatedField = {};

    // If a new profile picture is uploaded
    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "user_profiles"
      );
      updatedField.profilePicture = uploadResult.secure_url;
    } else {
      // Keep existing image if no new one uploaded
      updatedField.profilePicture = existingUser.profilePicture;
    }

    // Parse skills if sent as JSON string
    if (incomingData.skills) {
      try {
        updatedField.skills = JSON.parse(incomingData.skills);
      } catch {
        updatedField.skills = incomingData.skills; // already array
      }
    }

    // Add other fields that have changed
    Object.keys(incomingData).forEach((key) => {
      if (
        key !== "skills" &&
        incomingData[key] !== undefined &&
        incomingData[key] !== existingUser[key]
      ) {
        updatedField[key] = incomingData[key];
      }
    });

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updatedField },
      { new: true }
    );

    return res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      message: "Error updating data",
      error: error.message,
    });
  }
};

export const FetchProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      profile,
    });
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
