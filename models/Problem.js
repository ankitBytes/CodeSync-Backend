import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  // Basic problem information
  title: { 
    type: String, 
    required: true,
    maxLength: 200,
    unique: true
  },
  slug: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    minLength: 50
  },
  
  // Problem classification
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    required: true 
  },
  category: { 
    type: String, 
    enum: [
      'arrays', 'strings', 'trees', 'graphs', 'dynamic-programming', 
      'greedy', 'backtracking', 'bit-manipulation', 'math', 'design', 
      'two-pointers', 'sliding-window', 'binary-search', 'sorting',
      'stack', 'queue', 'linked-list', 'heap', 'trie', 'union-find',
      'other'
    ], 
    required: true 
  },
  subcategories: [{ type: String }],
  tags: [{ type: String }],
  
  // Problem content
  problemStatement: { 
    type: String, 
    required: true 
  },
  examples: [{
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String },
    isHidden: { type: Boolean, default: false }
  }],
  constraints: { 
    type: String,
    required: true
  },
  followUp: { type: String },
  
  // Test cases
  testCases: [{
    input: { type: String, required: true },
    output: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
    isSample: { type: Boolean, default: false },
    explanation: { type: String },
    timeLimit: { type: Number, default: 1000 }, // milliseconds
    memoryLimit: { type: Number, default: 128 } // MB
  }],
  
  // Solution and hints
  solution: { 
    type: String,
    select: false // Hidden by default, only for admins
  },
  hints: [{ 
    type: String,
    maxLength: 500
  }],
  approach: { type: String },
  
  // Statistics and metrics
  stats: {
    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 }, // percentage
    averageSolveTime: { type: Number, default: 0 }, // minutes
    difficultyRating: { type: Number, default: 0 }, // user-rated difficulty 1-10
    popularity: { type: Number, default: 0 }, // based on views and attempts
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Supported languages and templates
  supportedLanguages: [{
    language: { 
      type: String, 
      enum: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust', 'swift', 'kotlin', 'php', 'ruby', 'scala', 'typescript'],
      required: true
    },
    starterCode: { type: String, required: true },
    solutionCode: { type: String, select: false },
    testRunner: { type: String }, // Custom test runner if needed
    isEnabled: { type: Boolean, default: true }
  }],
  
  // Problem metadata
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  contributors: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  source: { type: String }, // Original source if problem is from elsewhere
  license: { type: String, default: 'MIT' },
  
  // Problem lifecycle
  status: { 
    type: String, 
    enum: ['draft', 'review', 'published', 'archived', 'deprecated'], 
    default: 'draft' 
  },
  publishedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: { type: String },
  
  // Problem settings
  settings: {
    allowCollaboration: { type: Boolean, default: true },
    allowDiscussion: { type: Boolean, default: true },
    allowHints: { type: Boolean, default: true },
    allowSolution: { type: Boolean, default: false },
    timeLimit: { type: Number, default: 30000 }, // milliseconds
    memoryLimit: { type: Number, default: 128 }, // MB
    maxSubmissions: { type: Number, default: 10 },
    isPremium: { type: Boolean, default: false },
    requiresVerification: { type: Boolean, default: false }
  },
  
  // Related problems
  relatedProblems: [{
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    relationship: { type: String, enum: ['similar', 'prerequisite', 'next', 'related'] }
  }],
  
  // Learning resources
  resources: [{
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['article', 'video', 'book', 'course', 'other'] },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    isFree: { type: Boolean, default: true }
  }],
  
  // Discussion and community
  discussion: {
    enabled: { type: Boolean, default: true },
    totalComments: { type: Number, default: 0 },
    lastCommentAt: { type: Date },
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  
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

// Virtual for problem URL
problemSchema.virtual('problemUrl').get(function() {
  return `/problem/${this.slug}`;
});

// Virtual for difficulty score
problemSchema.virtual('difficultyScore').get(function() {
  const difficultyMap = { 'easy': 1, 'medium': 2, 'hard': 3 };
  return difficultyMap[this.difficulty] || 0;
});

// Virtual for isSolved (for authenticated users)
problemSchema.virtual('isSolved').get(function() {
  // This will be populated when querying with user context
  return false;
});

// Indexes for better query performance
problemSchema.index({ slug: 1 });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ category: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ status: 1 });
problemSchema.index({ author: 1 });
problemSchema.index({ 'stats.acceptanceRate': -1 });
problemSchema.index({ 'stats.popularity': -1 });
problemSchema.index({ publishedAt: -1 });
problemSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Pre-save middleware to update statistics
problemSchema.pre('save', function(next) {
  if (this.isModified('stats.totalSubmissions') || this.isModified('stats.acceptedSubmissions')) {
    if (this.stats.totalSubmissions > 0) {
      this.stats.acceptanceRate = Math.round((this.stats.acceptedSubmissions / this.stats.totalSubmissions) * 100);
    }
  }
  
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Pre-save middleware to generate slug from title
problemSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Method to update submission statistics
problemSchema.methods.updateSubmissionStats = function(accepted = false, solveTime = 0) {
  this.stats.totalSubmissions += 1;
  
  if (accepted) {
    this.stats.acceptedSubmissions += 1;
  }
  
  if (solveTime > 0) {
    const currentAvg = this.stats.averageSolveTime;
    const totalSolved = this.stats.acceptedSubmissions;
    this.stats.averageSolveTime = Math.round(((currentAvg * (totalSolved - 1)) + solveTime) / totalSolved);
  }
  
  this.stats.lastUpdated = new Date();
  return this.save();
};

// Method to add test case
problemSchema.methods.addTestCase = function(testCase) {
  this.testCases.push(testCase);
  return this.save();
};

// Method to update problem status
problemSchema.methods.updateStatus = function(newStatus, reviewedBy = null, notes = '') {
  this.status = newStatus;
  
  if (reviewedBy) {
    this.reviewedBy = reviewedBy;
  }
  
  if (notes) {
    this.reviewNotes = notes;
  }
  
  if (newStatus === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  return this.save();
};

// Method to add contributor
problemSchema.methods.addContributor = function(userId) {
  if (!this.contributors.includes(userId)) {
    this.contributors.push(userId);
    return this.save();
  }
  return this;
};

// Method to get problem summary
problemSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    slug: this.slug,
    difficulty: this.difficulty,
    category: this.category,
    tags: this.tags,
    acceptanceRate: this.stats.acceptanceRate,
    totalSubmissions: this.stats.totalSubmissions,
    status: this.status,
    publishedAt: this.publishedAt,
    supportedLanguages: this.supportedLanguages.map(l => l.language)
  };
};

// Method to check if user can access problem
problemSchema.methods.canAccess = function(user) {
  if (this.status !== 'published') {
    return false;
  }
  
  if (this.settings.isPremium && !user.isPremium) {
    return false;
  }
  
  return true;
};

// Static method to find problems by difficulty and category
problemSchema.statics.findByDifficultyAndCategory = function(difficulty, category, limit = 10) {
  return this.find({ 
    difficulty, 
    category, 
    status: 'published' 
  })
  .sort({ 'stats.popularity': -1 })
  .limit(limit);
};

// Static method to find similar problems
problemSchema.statics.findSimilar = function(problemId, limit = 5) {
  return this.findById(problemId)
    .then(problem => {
      if (!problem) return [];
      
      return this.find({
        _id: { $ne: problemId },
        category: problem.category,
        difficulty: problem.difficulty,
        status: 'published',
        tags: { $in: problem.tags }
      })
      .sort({ 'stats.popularity': -1 })
      .limit(limit);
    });
};

export default mongoose.model("Problem", problemSchema);
