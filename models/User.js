import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  // Basic authentication
  googleId: { type: String },
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String },
  provider: { type: String, default: "local" },
  
  // User roles and permissions
  role: { 
    type: String, 
    enum: ['student', 'mentor', 'admin'], 
    default: 'student' 
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isPremium: { type: Boolean, default: false },
  
  // Profile information
  username: { 
    type: String, 
    unique: true, 
    required: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/
  },
  bio: { type: String, maxLength: 500 },
  location: { type: String },
  website: { type: String },
  
  // Social profiles
  githubProfile: { type: String },
  leetcodeProfile: { type: String },
  linkedinProfile: { type: String },
  
  // Coding statistics and progress
  stats: {
    problemsSolved: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    totalTimeSpent: { type: Number, default: 0 }, // in minutes
    averageSolveTime: { type: Number, default: 0 }, // in minutes
    submissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 }
  },
  
  // Skill levels by category
  skills: {
    arrays: { type: Number, default: 0, min: 0, max: 100 },
    strings: { type: Number, default: 0, min: 0, max: 100 },
    trees: { type: Number, default: 0, min: 0, max: 100 },
    graphs: { type: Number, default: 0, min: 0, max: 100 },
    dynamicProgramming: { type: Number, default: 0, min: 0, max: 100 },
    greedy: { type: Number, default: 0, min: 0, max: 100 },
    backtracking: { type: Number, default: 0, min: 0, max: 100 },
    bitManipulation: { type: Number, default: 0, min: 0, max: 100 }
  },
  
  // Programming languages proficiency
  languages: [{
    name: { type: String, required: true },
    proficiency: { type: Number, min: 1, max: 5, default: 1 },
    problemsSolved: { type: Number, default: 0 }
  }],
  
  // Collaboration preferences and settings
  collaborationSettings: {
    allowPairProgramming: { type: Boolean, default: true },
    allowCodeReview: { type: Boolean, default: true },
    allowMentoring: { type: Boolean, default: false },
    preferredLanguages: [{ type: String }],
    timezone: { type: String, default: 'UTC' },
    availability: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: false },
      sunday: { type: Boolean, default: false }
    },
    preferredDifficulty: { 
      type: String, 
      enum: ['easy', 'medium', 'hard', 'any'], 
      default: 'any' 
    }
  },
  
  // Social features
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  mentors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  mentees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Achievements and badges
  achievements: [{
    name: { type: String, required: true },
    description: { type: String },
    earnedAt: { type: Date, default: Date.now },
    icon: { type: String }
  }],
  
  // Preferences
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      collaboration: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true }
    },
    privacy: {
      showStats: { type: Boolean, default: true },
      showActivity: { type: Boolean, default: true },
      allowMessages: { type: Boolean, default: true }
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full profile URL
userSchema.virtual('profileUrl').get(function() {
  return `/user/${this.username}`;
});

// Virtual for acceptance rate
userSchema.virtual('acceptanceRate').get(function() {
  if (this.stats.submissions === 0) return 0;
  return Math.round((this.stats.acceptedSubmissions / this.stats.submissions) * 100);
});

// Virtual for total followers count
userSchema.virtual('followersCount').get(function() {
  return this.followers.length;
});

// Virtual for total following count
userSchema.virtual('followingCount').get(function() {
  return this.following.length;
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'stats.problemsSolved': -1 });
userSchema.index({ 'stats.totalScore': -1 });
userSchema.index({ 'stats.streakDays': -1 });

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12); // Increased from 10 to 12 for better security
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to update stats
userSchema.methods.updateStats = function(problemSolved = false, timeSpent = 0, submissionAccepted = false) {
  if (problemSolved) {
    this.stats.problemsSolved += 1;
    this.stats.streakDays += 1;
    this.stats.currentStreak += 1;
    
    if (this.stats.currentStreak > this.stats.longestStreak) {
      this.stats.longestStreak = this.stats.currentStreak;
    }
  }
  
  if (timeSpent > 0) {
    this.stats.totalTimeSpent += timeSpent;
    this.stats.averageSolveTime = Math.round(this.stats.totalTimeSpent / this.stats.problemsSolved);
  }
  
  if (submissionAccepted) {
    this.stats.acceptedSubmissions += 1;
  }
  
  this.stats.submissions += 1;
  this.stats.lastActive = new Date();
  
  return this.save();
};

// Method to reset streak if user hasn't been active
userSchema.methods.checkAndResetStreak = function() {
  const now = new Date();
  const lastActive = new Date(this.stats.lastActive);
  const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > 1) {
    this.stats.currentStreak = 0;
    this.stats.streakDays = 0;
  }
  
  return this.save();
};

export default mongoose.model("User", userSchema);
