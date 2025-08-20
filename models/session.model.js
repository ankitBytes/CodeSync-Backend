import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  // Basic session information
  title: { 
    type: String, 
    required: true,
    maxLength: 100 
  },
  description: { 
    type: String, 
    maxLength: 500 
  },
  
  // Problem/Challenge association
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true
  },
  
  // Session creator and ownership
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // Participants and their roles
  participants: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true
    },
    role: { 
      type: String, 
      enum: ['owner', 'collaborator', 'viewer', 'mentor'], 
      default: 'collaborator' 
    },
    joinedAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
    permissions: {
      canEdit: { type: Boolean, default: true },
      canInvite: { type: Boolean, default: false },
      canDelete: { type: Boolean, default: false },
      canManageParticipants: { type: Boolean, default: false }
    }
  }],
  
  // Session status and lifecycle
  status: { 
    type: String, 
    enum: ['active', 'paused', 'completed', 'archived'], 
    default: 'active' 
  },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  duration: { type: Number }, // in minutes
  
  // Problem metadata
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['arrays', 'strings', 'trees', 'graphs', 'dynamic-programming', 'greedy', 'backtracking', 'bit-manipulation', 'math', 'design', 'other'], 
    required: true 
  },
  estimatedDuration: { type: Number }, // in minutes
  tags: [{ type: String }],
  
  // Code state and versioning
  codeState: {
    language: { 
      type: String, 
      required: true,
      enum: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust', 'swift', 'kotlin', 'php', 'ruby', 'scala', 'typescript']
    },
    code: { type: String, default: '' },
    version: { type: Number, default: 1 },
    lastSaved: { type: Date, default: Date.now },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    autoSave: { type: Boolean, default: true }
  },
  
  // Code execution and testing
  execution: {
    isRunning: { type: Boolean, default: false },
    lastRunAt: { type: Date },
    testResults: [{
      testCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' },
      input: { type: String },
      expectedOutput: { type: String },
      actualOutput: { type: String },
      passed: { type: Boolean },
      executionTime: { type: Number }, // in milliseconds
      memoryUsed: { type: Number }, // in MB
      error: { type: String }
    }],
    totalTests: { type: Number, default: 0 },
    passedTests: { type: Number, default: 0 },
    failedTests: { type: Number, default: 0 }
  },
  
  // Real-time collaboration features
  collaborationState: {
    isActive: { type: Boolean, default: false },
    maxParticipants: { type: Number, default: 4, min: 1, max: 10 },
    allowAnonymous: { type: Boolean, default: false },
    chatEnabled: { type: Boolean, default: true },
    voiceEnabled: { type: Boolean, default: false },
    screenShareEnabled: { type: Boolean, default: false },
    recordingEnabled: { type: Boolean, default: false }
  },
  
  // Chat and communication
  chat: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, maxLength: 1000 },
    messageType: { type: String, enum: ['text', 'code', 'system', 'announcement'], default: 'text' },
    timestamp: { type: Date, default: Date.now },
    edited: { type: Boolean, default: false },
    editedAt: { type: Date }
  }],
  
  // Code changes and history
  codeHistory: [{
    version: { type: Number, required: true },
    code: { type: String, required: true },
    changeDescription: { type: String },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    diff: { type: String } // Store git-like diff
  }],
  
  // Cursor positions and selections (for real-time collaboration)
  cursors: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    position: {
      line: { type: Number, required: true },
      column: { type: Number, required: true }
    },
    selection: {
      start: { line: Number, column: Number },
      end: { line: Number, column: Number }
    },
    isTyping: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now }
  }],
  
  // Session settings and preferences
  settings: {
    autoSaveInterval: { type: Number, default: 30000 }, // 30 seconds
    maxCodeHistory: { type: Number, default: 50 },
    allowCodeExecution: { type: Boolean, default: true },
    allowFileUpload: { type: Boolean, default: false },
    allowExternalResources: { type: Boolean, default: false },
    timeLimit: { type: Number }, // in minutes
    memoryLimit: { type: Number }, // in MB
  },
  
  // Analytics and insights
  analytics: {
    totalEdits: { type: Number, default: 0 },
    totalCollaborationTime: { type: Number, default: 0 }, // in minutes
    averageParticipants: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }, // percentage
    userEngagement: { type: Number, default: 0 } // score 0-100
  },
  
  // AI features (for future implementation)
  aiFeatures: {
    codeCompletion: { type: Boolean, default: false },
    codeReview: { type: Boolean, default: false },
    bugDetection: { type: Boolean, default: false },
    optimizationSuggestions: { type: Boolean, default: false },
    aiSummary: { type: String },
    aiSummaryGeneratedAt: { type: Date }
  },
  
  // Privacy and access control
  privacy: {
    isPublic: { type: Boolean, default: false },
    allowInvites: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    allowForking: { type: Boolean, default: false },
    visibleTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  
  // Notifications and reminders
  notifications: {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reminders: [{
      type: { type: String, enum: ['session_start', 'break_time', 'session_end'] },
      scheduledAt: { type: Date },
      sent: { type: Boolean, default: false }
    }]
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for session duration
sessionSchema.virtual('durationMinutes').get(function() {
  if (this.endedAt && this.startedAt) {
    return Math.round((this.endedAt - this.startedAt) / (1000 * 60));
  }
  return 0;
});

// Virtual for active participants count
sessionSchema.virtual('activeParticipantsCount').get(function() {
  return this.participants.filter(p => 
    (new Date() - new Date(p.lastActive)) < (5 * 60 * 1000) // 5 minutes
  ).length;
});

// Virtual for completion status
sessionSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed' || this.execution.passedTests === this.execution.totalTests;
});

// Virtual for session progress
sessionSchema.virtual('progress').get(function() {
  if (this.execution.totalTests === 0) return 0;
  return Math.round((this.execution.passedTests / this.execution.totalTests) * 100);
});

// Indexes for better query performance
sessionSchema.index({ creator: 1 });
sessionSchema.index({ problemId: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ difficulty: 1 });
sessionSchema.index({ category: 1 });
sessionSchema.index({ 'participants.userId': 1 });
sessionSchema.index({ startedAt: -1 });
sessionSchema.index({ 'codeState.language': 1 });

// Pre-save middleware to update analytics
sessionSchema.pre('save', function(next) {
  if (this.isModified('execution.testResults')) {
    this.execution.totalTests = this.execution.testResults.length;
    this.execution.passedTests = this.execution.testResults.filter(t => t.passed).length;
    this.execution.failedTests = this.execution.totalTests - this.execution.passedTests;
  }
  
  if (this.isModified('codeHistory')) {
    this.analytics.totalEdits = this.codeHistory.length;
  }
  
  next();
});

// Method to add participant
sessionSchema.methods.addParticipant = function(userId, role = 'collaborator') {
  if (this.participants.length >= this.collaborationState.maxParticipants) {
    throw new Error('Session is full');
  }
  
  if (this.participants.find(p => p.userId.toString() === userId.toString())) {
    throw new Error('User is already a participant');
  }
  
  this.participants.push({
    userId,
    role,
    joinedAt: new Date(),
    lastActive: new Date()
  });
  
  return this.save();
};

// Method to remove participant
sessionSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.userId.toString() !== userId.toString());
  return this.save();
};

// Method to update code with versioning
sessionSchema.methods.updateCode = function(newCode, userId, changeDescription = '') {
  // Store current code in history
  this.codeHistory.push({
    version: this.codeState.version,
    code: this.codeState.code,
    changeDescription: changeDescription || `Updated by ${userId}`,
    changedBy: userId,
    timestamp: new Date()
  });
  
  // Update current code
  this.codeState.code = newCode;
  this.codeState.version += 1;
  this.codeState.lastSaved = new Date();
  this.codeState.lastModifiedBy = userId;
  
  // Limit history size
  if (this.codeHistory.length > this.settings.maxCodeHistory) {
    this.codeHistory = this.codeHistory.slice(-this.settings.maxCodeHistory);
  }
  
  return this.save();
};

// Method to start session
sessionSchema.methods.startSession = function() {
  this.status = 'active';
  this.startedAt = new Date();
  this.collaborationState.isActive = true;
  return this.save();
};

// Method to end session
sessionSchema.methods.endSession = function() {
  this.status = 'completed';
  this.endedAt = new Date();
  this.collaborationState.isActive = false;
  this.duration = this.durationMinutes;
  return this.save();
};

// Method to get session summary
sessionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    difficulty: this.difficulty,
    category: this.category,
    duration: this.durationMinutes,
    participants: this.participants.length,
    progress: this.progress,
    status: this.status,
    startedAt: this.startedAt,
    endedAt: this.endedAt
  };
};

export default mongoose.model("Session", sessionSchema);