import mongoose from "mongoose";

const collaborationRoomSchema = new mongoose.Schema({
  // Room identification
  roomId: { 
    type: String, 
    required: true, 
    unique: true,
    maxLength: 50
  },
  name: { 
    type: String, 
    required: true,
    maxLength: 100
  },
  description: { 
    type: String,
    maxLength: 500
  },
  
  // Session association
  sessionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Session',
    required: true
  },
  problemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Problem',
    required: true
  },
  
  // Room creator and ownership
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  
  // Room status and lifecycle
  status: { 
    type: String, 
    enum: ['waiting', 'active', 'paused', 'completed', 'archived'], 
    default: 'waiting' 
  },
  createdAt: { type: Date, default: Date.now },
  startedAt: { type: Date },
  endedAt: { type: Date },
  lastActivity: { type: Date, default: Date.now },
  
  // Room settings and configuration
  settings: {
    maxParticipants: { type: Number, default: 4, min: 1, max: 10 },
    allowAnonymous: { type: Boolean, default: false },
    requireApproval: { type: Boolean, default: false },
    allowChat: { type: Boolean, default: true },
    allowVoice: { type: Boolean, default: false },
    allowScreenShare: { type: Boolean, default: false },
    allowRecording: { type: Boolean, default: false },
    allowFileUpload: { type: Boolean, default: false },
    allowExternalResources: { type: Boolean, default: false },
    timeLimit: { type: Number }, // in minutes
    autoClose: { type: Boolean, default: true },
    autoCloseDelay: { type: Number, default: 300 } // 5 minutes
  },
  
  // Participants and their roles
  participants: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    username: { type: String, required: true },
    displayName: { type: String, required: true },
    avatar: { type: String },
    role: { 
      type: String, 
      enum: ['owner', 'moderator', 'participant', 'viewer'], 
      default: 'participant' 
    },
    permissions: {
      canEdit: { type: Boolean, default: true },
      canChat: { type: Boolean, default: true },
      canInvite: { type: Boolean, default: false },
      canKick: { type: Boolean, default: false },
      canManageSettings: { type: Boolean, default: false }
    },
    joinedAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: true },
    isTyping: { type: Boolean, default: false },
    connectionId: { type: String }, // Socket.io connection ID
    userAgent: { type: String },
    ipAddress: { type: String }
  }],
  
  // Real-time collaboration state
  collaborationState: {
    isActive: { type: Boolean, default: false },
    currentLanguage: { 
      type: String, 
      enum: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust', 'swift', 'kotlin', 'php', 'ruby', 'scala', 'typescript'],
      default: 'javascript'
    },
    codeVersion: { type: Number, default: 1 },
    lastCodeUpdate: { type: Date, default: Date.now },
    lastCodeUpdateBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    autoSave: { type: Boolean, default: true },
    autoSaveInterval: { type: Number, default: 30000 } // 30 seconds
  },
  
  // Cursor positions and selections
  cursors: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String, required: true },
    displayName: { type: String, required: true },
    avatar: { type: String },
    position: {
      line: { type: Number, required: true },
      column: { type: Number, required: true }
    },
    selection: {
      start: { line: Number, column: Number },
      end: { line: Number, column: Number }
    },
    isTyping: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now },
    color: { type: String, default: '#007acc' } // Unique color for each user
  }],
  
  // Chat and communication
  chat: [{
    id: { type: String, required: true, unique: true }, // Unique message ID
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String, required: true },
    displayName: { type: String, required: true },
    avatar: { type: String },
    message: { type: String, maxLength: 1000, required: true },
    messageType: { 
      type: String, 
      enum: ['text', 'code', 'system', 'announcement', 'file', 'link'], 
      default: 'text' 
    },
    codeBlock: {
      language: { type: String },
      code: { type: String }
    },
    file: {
      name: { type: String },
      url: { type: String },
      size: { type: Number },
      type: { type: String }
    },
    link: {
      url: { type: String },
      title: { type: String },
      description: { type: String }
    },
    timestamp: { type: Date, default: Date.now },
    edited: { type: Boolean, default: false },
    editedAt: { type: Date },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reactions: [{
      emoji: { type: String, required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now }
    }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPinned: { type: Boolean, default: false }
  }],
  
  // Code changes and history
  codeChanges: [{
    id: { type: String, required: true, unique: true },
    version: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String, required: true },
    changeType: { 
      type: String, 
      enum: ['insert', 'delete', 'replace', 'move', 'format'], 
      required: true 
    },
    changeDescription: { type: String },
    timestamp: { type: Date, default: Date.now },
    diff: { type: String }, // Git-like diff
    lineNumbers: {
      start: { type: Number },
      end: { type: Number }
    },
    codeBefore: { type: String },
    codeAfter: { type: String },
    reverted: { type: Boolean, default: false },
    revertedAt: { type: Date },
    revertedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // File management
  files: [{
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
    isPublic: { type: Boolean, default: true },
    downloads: { type: Number, default: 0 }
  }],
  
  // Room analytics and insights
  analytics: {
    totalParticipants: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    totalCodeChanges: { type: Number, default: 0 },
    totalFiles: { type: Number, default: 0 },
    averageSessionTime: { type: Number, default: 0 }, // in minutes
    peakParticipants: { type: Number, default: 0 },
    userEngagement: { type: Number, default: 0 } // score 0-100
  },
  
  // Notifications and reminders
  notifications: {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reminders: [{
      type: { type: String, enum: ['session_start', 'break_time', 'session_end', 'custom'] },
      message: { type: String, required: true },
      scheduledAt: { type: Date, required: true },
      sent: { type: Boolean, default: false },
      sentAt: { type: Date }
    }],
    settings: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      inAppNotifications: { type: Boolean, default: true }
    }
  },
  
  // Privacy and access control
  privacy: {
    isPublic: { type: Boolean, default: false },
    allowInvites: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    allowForking: { type: Boolean, default: false },
    visibleTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    password: { type: String }, // Optional room password
    isPasswordProtected: { type: Boolean, default: false }
  },
  
  // Room metadata
  tags: [{ type: String }],
  category: { type: String },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'] 
  },
  estimatedDuration: { type: Number }, // in minutes
  
  // Versioning and history
  version: { type: Number, default: 1 },
  changelog: [{
    version: { type: Number, required: true },
    changes: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for room duration
collaborationRoomSchema.virtual('durationMinutes').get(function() {
  if (this.endedAt && this.startedAt) {
    return Math.round((this.endedAt - this.startedAt) / (1000 * 60));
  }
  return 0;
});

// Virtual for active participants count
collaborationRoomSchema.virtual('activeParticipantsCount').get(function() {
  return this.participants.filter(p => p.isOnline).length;
});

// Virtual for room URL
collaborationRoomSchema.virtual('roomUrl').get(function() {
  return `/room/${this.roomId}`;
});

// Virtual for isFull
collaborationRoomSchema.virtual('isFull').get(function() {
  return this.participants.length >= this.settings.maxParticipants;
});

// Indexes for better query performance
collaborationRoomSchema.index({ roomId: 1 });
collaborationRoomSchema.index({ sessionId: 1 });
collaborationRoomSchema.index({ problemId: 1 });
collaborationRoomSchema.index({ creator: 1 });
collaborationRoomSchema.index({ status: 1 });
collaborationRoomSchema.index({ 'participants.userId': 1 });
collaborationRoomSchema.index({ createdAt: -1 });
collaborationRoomSchema.index({ lastActivity: -1 });

// Pre-save middleware to update analytics
collaborationRoomSchema.pre('save', function(next) {
  if (this.isModified('participants')) {
    this.analytics.totalParticipants = this.participants.length;
    this.analytics.peakParticipants = Math.max(this.analytics.peakParticipants, this.participants.length);
  }
  
  if (this.isModified('chat')) {
    this.analytics.totalMessages = this.chat.length;
  }
  
  if (this.isModified('codeChanges')) {
    this.analytics.totalCodeChanges = this.codeChanges.length;
  }
  
  if (this.isModified('files')) {
    this.analytics.totalFiles = this.files.length;
  }
  
  next();
});

// Method to add participant
collaborationRoomSchema.methods.addParticipant = function(userId, username, displayName, avatar = null, role = 'participant') {
  if (this.isFull) {
    throw new Error('Room is full');
  }
  
  if (this.participants.find(p => p.userId.toString() === userId.toString())) {
    throw new Error('User is already a participant');
  }
  
  this.participants.push({
    userId,
    username,
    displayName,
    avatar,
    role,
    joinedAt: new Date(),
    lastActive: new Date(),
    isOnline: true
  });
  
  this.lastActivity = new Date();
  return this.save();
};

// Method to remove participant
collaborationRoomSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.userId.toString() !== userId.toString());
  this.lastActivity = new Date();
  return this.save();
};

// Method to update participant activity
collaborationRoomSchema.methods.updateParticipantActivity = function(userId, isOnline = true) {
  const participant = this.participants.find(p => p.userId.toString() === userId.toString());
  if (participant) {
    participant.lastActive = new Date();
    participant.isOnline = isOnline;
    this.lastActivity = new Date();
    return this.save();
  }
  return this;
};

// Method to add chat message
collaborationRoomSchema.methods.addChatMessage = function(messageData) {
  const message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...messageData,
    timestamp: new Date()
  };
  
  this.chat.push(message);
  this.lastActivity = new Date();
  return this.save();
};

// Method to add code change
collaborationRoomSchema.methods.addCodeChange = function(changeData) {
  const change = {
    id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...changeData,
    timestamp: new Date()
  };
  
  this.codeChanges.push(change);
  this.collaborationState.codeVersion += 1;
  this.collaborationState.lastCodeUpdate = new Date();
  this.collaborationState.lastCodeUpdateBy = changeData.userId;
  this.lastActivity = new Date();
  return this.save();
};

// Method to update cursor position
collaborationRoomSchema.methods.updateCursor = function(userId, username, displayName, avatar, position, selection = null, isTyping = false) {
  let cursor = this.cursors.find(c => c.userId.toString() === userId.toString());
  
  if (cursor) {
    cursor.position = position;
    cursor.selection = selection;
    cursor.isTyping = isTyping;
    cursor.lastUpdated = new Date();
  } else {
    this.cursors.push({
      userId,
      username,
      displayName,
      avatar,
      position,
      selection,
      isTyping,
      lastUpdated: new Date(),
      color: this.getUserColor(userId)
    });
  }
  
  this.lastActivity = new Date();
  return this.save();
};

// Method to get unique color for user
collaborationRoomSchema.methods.getUserColor = function(userId) {
  const colors = [
    '#007acc', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6',
    '#3498db', '#e67e22', '#1abc9c', '#34495e', '#f1c40f'
  ];
  
  const userIndex = this.participants.findIndex(p => p.userId.toString() === userId.toString());
  return colors[userIndex % colors.length];
};

// Method to start room
collaborationRoomSchema.methods.startRoom = function() {
  this.status = 'active';
  this.startedAt = new Date();
  this.collaborationState.isActive = true;
  return this.save();
};

// Method to end room
collaborationRoomSchema.methods.endRoom = function() {
  this.status = 'completed';
  this.endedAt = new Date();
  this.collaborationState.isActive = false;
  return this.save();
};

// Method to get room summary
collaborationRoomSchema.methods.getSummary = function() {
  return {
    id: this._id,
    roomId: this.roomId,
    name: this.name,
    status: this.status,
    participants: this.participants.length,
    maxParticipants: this.settings.maxParticipants,
    createdAt: this.createdAt,
    startedAt: this.startedAt,
    endedAt: this.endedAt,
    duration: this.durationMinutes,
    lastActivity: this.lastActivity
  };
};

// Static method to find active rooms
collaborationRoomSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).sort({ lastActivity: -1 });
};

// Static method to find rooms by problem
collaborationRoomSchema.statics.findByProblem = function(problemId) {
  return this.find({ problemId, status: { $in: ['waiting', 'active'] } }).sort({ createdAt: -1 });
};

// Static method to find rooms by user
collaborationRoomSchema.statics.findByUser = function(userId) {
  return this.find({ 'participants.userId': userId }).sort({ lastActivity: -1 });
};

export default mongoose.model("CollaborationRoom", collaborationRoomSchema);
