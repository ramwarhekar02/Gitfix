const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    baseCode: {
      type: String,
      required: true,
    },
    branchA: {
      type: String,
      required: true,
    },
    branchB: {
      type: String,
      required: true,
    },
    mergedCode: {
      type: String,
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    explanation: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Analysis', analysisSchema);
