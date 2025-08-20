import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  // Test case identification
  name: { 
    type: String, 
    required: true,
    maxLength: 100
  },
  description: { 
    type: String,
    maxLength: 500
  },
  
  // Test case data
  input: { 
    type: String, 
    required: true 
  },
  expectedOutput: { 
    type: String, 
    required: true 
  },
  
  // Test case metadata
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  testCaseNumber: { 
    type: Number, 
    required: true 
  },
  
  // Test case configuration
  isHidden: { 
    type: Boolean, 
    default: false 
  },
  isSample: { 
    type: Boolean, 
    default: false 
  },
  isRequired: { 
    type: Boolean, 
    default: true 
  },
  
  // Execution constraints
  timeLimit: { 
    type: Number, 
    default: 1000, // milliseconds
    min: 100,
    max: 30000
  },
  memoryLimit: { 
    type: Number, 
    default: 128, // MB
    min: 16,
    max: 1024
  },
  
  // Input/Output specifications
  inputFormat: { 
    type: String,
    description: 'Description of input format'
  },
  outputFormat: { 
    type: String,
    description: 'Description of expected output format'
  },
  
  // Test case explanation
  explanation: { 
    type: String,
    maxLength: 1000
  },
  hints: [{ 
    type: String,
    maxLength: 200
  }],
  
  // Test case categories
  category: { 
    type: String,
    enum: ['edge-case', 'normal', 'boundary', 'performance', 'corner-case', 'other'],
    default: 'normal'
  },
  tags: [{ type: String }],
  
  // Test case statistics
  stats: {
    totalRuns: { type: Number, default: 0 },
    successfulRuns: { type: Number, default: 0 },
    failedRuns: { type: Number, default: 0 },
    averageExecutionTime: { type: Number, default: 0 }, // milliseconds
    averageMemoryUsage: { type: Number, default: 0 }, // MB
    lastRunAt: { type: Date }
  },
  
  // Test case validation
  validation: {
    inputValidation: { type: String }, // Regex or validation rules
    outputValidation: { type: String }, // Regex or validation rules
    allowPartialMatch: { type: Boolean, default: false },
    caseSensitive: { type: Boolean, default: true },
    trimWhitespace: { type: Boolean, default: true },
    normalizeNewlines: { type: Boolean, default: true }
  },
  
  // Test case dependencies
  dependencies: [{
    testCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' },
    dependencyType: { type: String, enum: ['prerequisite', 'related', 'exclusive'] }
  }],
  
  // Test case author and management
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'deprecated'], 
    default: 'active' 
  },
  
  // Test case versioning
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

// Virtual for success rate
testCaseSchema.virtual('successRate').get(function() {
  if (this.stats.totalRuns === 0) return 0;
  return Math.round((this.stats.successfulRuns / this.stats.totalRuns) * 100);
});

// Virtual for failure rate
testCaseSchema.virtual('failureRate').get(function() {
  if (this.stats.totalRuns === 0) return 0;
  return Math.round((this.stats.failedRuns / this.stats.totalRuns) * 100);
});

// Virtual for test case identifier
testCaseSchema.virtual('identifier').get(function() {
  return `TC${this.testCaseNumber.toString().padStart(3, '0')}`;
});

// Indexes for better query performance
testCaseSchema.index({ problemId: 1, testCaseNumber: 1 });
testCaseSchema.index({ problemId: 1, isHidden: 1 });
testCaseSchema.index({ problemId: 1, isSample: 1 });
testCaseSchema.index({ problemId: 1, category: 1 });
testCaseSchema.index({ author: 1 });
testCaseSchema.index({ status: 1 });
testCaseSchema.index({ 'stats.totalRuns': -1 });

// Pre-save middleware to update statistics
testCaseSchema.pre('save', function(next) {
  if (this.isModified('stats.totalRuns') || this.isModified('stats.successfulRuns')) {
    this.stats.failedRuns = this.stats.totalRuns - this.stats.successfulRuns;
  }
  next();
});

// Method to update execution statistics
testCaseSchema.methods.updateExecutionStats = function(executionTime, memoryUsage, success = false) {
  this.stats.totalRuns += 1;
  
  if (success) {
    this.stats.successfulRuns += 1;
  } else {
    this.stats.failedRuns += 1;
  }
  
  // Update average execution time
  if (executionTime > 0) {
    const currentAvg = this.stats.averageExecutionTime;
    const totalRuns = this.stats.totalRuns;
    this.stats.averageExecutionTime = Math.round(((currentAvg * (totalRuns - 1)) + executionTime) / totalRuns);
  }
  
  // Update average memory usage
  if (memoryUsage > 0) {
    const currentAvg = this.stats.averageMemoryUsage;
    const totalRuns = this.stats.totalRuns;
    this.stats.averageMemoryUsage = Math.round(((currentAvg * (totalRuns - 1)) + memoryUsage) / totalRuns);
  }
  
  this.stats.lastRunAt = new Date();
  return this.save();
};

// Method to validate input/output
testCaseSchema.methods.validateInput = function(input) {
  if (this.validation.inputValidation) {
    try {
      const regex = new RegExp(this.validation.inputValidation);
      return regex.test(input);
    } catch (error) {
      // If regex is invalid, fall back to basic validation
      return true;
    }
  }
  return true;
};

testCaseSchema.methods.validateOutput = function(output) {
  if (this.validation.outputValidation) {
    try {
      const regex = new RegExp(this.validation.outputValidation);
      return regex.test(output);
    } catch (error) {
      // If regex is invalid, fall back to basic validation
      return true;
    }
  }
  return true;
};

// Method to compare expected vs actual output
testCaseSchema.methods.compareOutput = function(actualOutput) {
  let expected = this.expectedOutput;
  let actual = actualOutput;
  
  // Apply validation rules
  if (this.validation.trimWhitespace) {
    expected = expected.trim();
    actual = actual.trim();
  }
  
  if (this.validation.normalizeNewlines) {
    expected = expected.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    actual = actual.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }
  
  if (!this.validation.caseSensitive) {
    expected = expected.toLowerCase();
    actual = actual.toLowerCase();
  }
  
  if (this.validation.allowPartialMatch) {
    return actual.includes(expected) || expected.includes(actual);
  }
  
  return expected === actual;
};

// Method to get test case summary
testCaseSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    identifier: this.identifier,
    isHidden: this.isHidden,
    isSample: this.isSample,
    category: this.category,
    timeLimit: this.timeLimit,
    memoryLimit: this.memoryLimit,
    successRate: this.successRate,
    totalRuns: this.stats.totalRuns
  };
};

// Method to update test case
testCaseSchema.methods.updateTestCase = function(updates, changedBy) {
  // Store current version in changelog
  this.changelog.push({
    version: this.version,
    changes: `Updated by ${changedBy}`,
    changedBy: changedBy,
    timestamp: new Date()
  });
  
  // Update version
  this.version += 1;
  
  // Apply updates
  Object.keys(updates).forEach(key => {
    if (this.schema.paths[key] && key !== 'version' && key !== 'changelog') {
      this[key] = updates[key];
    }
  });
  
  return this.save();
};

// Static method to find test cases by problem
testCaseSchema.statics.findByProblem = function(problemId, includeHidden = false) {
  const query = { problemId };
  
  if (!includeHidden) {
    query.isHidden = false;
  }
  
  return this.find(query).sort({ testCaseNumber: 1 });
};

// Static method to find sample test cases
testCaseSchema.statics.findSampleTestCases = function(problemId) {
  return this.find({ 
    problemId, 
    isSample: true 
  }).sort({ testCaseNumber: 1 });
};

// Static method to find hidden test cases
testCaseSchema.statics.findHiddenTestCases = function(problemId) {
  return this.find({ 
    problemId, 
    isHidden: true 
  }).sort({ testCaseNumber: 1 });
};

export default mongoose.model("TestCase", testCaseSchema);
