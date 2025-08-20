import Session from "../models/session.model.js";
import { v4 as uuidv4 } from "uuid";

export const createSession = async (req, res) => {
  try {
    const {
      title,
      description = "",
      tags = [],
      language,
      difficulty,
    } = req.body;

    // Prefer authenticated user; fallback to body for legacy
    const creatorId = req.user?.id || req.user?._id || req.body.userId;

    // Validate required inputs
    if (!creatorId) return res.status(401).json({ message: "Unauthorized" });

    const allowedDifficulties = ["easy", "medium", "hard"];
    const allowedLanguages = [
      "javascript",
      "python",
      "java",
      "cpp",
      "c",
      "csharp",
      "go",
      "rust",
      "swift",
      "kotlin",
      "php",
      "ruby",
      "scala",
      "typescript",
    ];

    // Validate if provided
    if (difficulty && !allowedDifficulties.includes(difficulty)) {
      return res
        .status(400)
        .json({ message: "Valid difficulty is required (easy|medium|hard)" });
    }

    if (language && !allowedLanguages.includes(language)) {
      return res.status(400).json({ message: "Valid language is required" });
    }

    const sessionId = uuidv4().slice(0, 8);

    // Build update document: only set fields that are provided
    const update = { $set: {}, $setOnInsert: {} };

    update.$set.sessionId = sessionId;

    if (title) update.$set.title = title;
    if (description !== undefined) update.$set.description = description;
    if (Array.isArray(tags)) update.$set.tags = tags;
    if (difficulty) update.$set.difficulty = difficulty;
    if (language) update.$set["codeState.language"] = language;

    // Defaults for insert
    update.$setOnInsert.creator = creatorId;
    update.$setOnInsert.difficulty = difficulty || "easy";
    update.$setOnInsert.participants = [
      {
        userId: creatorId,
        role: "owner",
        permissions: {
          canEdit: true,
          canInvite: true,
          canDelete: true,
          canManageParticipants: true,
        },
      },
    ];
    update.$setOnInsert["codeState.language"] = language || "javascript";
    update.$setOnInsert["codeState.code"] = "";

    // Ensure there is at least a title when creating
    if (!title) {
      // If no title and this would be an insert, reject
      const existing = await Session.findOne({
        creator: creatorId,
        status: "active",
      });
      if (!existing) {
        return res.status(400).json({ message: "Title is required" });
      }
    }

    const updatedSession = await Session.findOneAndUpdate(
      { creator: creatorId, status: "active" },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res
      .status(201)
      .json({
        message: "Session created successfully",
        session: updatedSession,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create session", error: error.message });
  }
};
