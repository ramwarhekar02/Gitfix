const Joi = require('joi');
const Analysis = require('../models/Analysis');
const { runAiMerge } = require('../services/aiService');

const conflictAnalyzeSchema = Joi.object({
  baseCode: Joi.string().allow('').required().messages({
    'any.required': 'Base code is required',
  }),
  branchA: Joi.string().allow('').required().messages({
    'any.required': 'Branch A code is required',
  }),
  branchB: Joi.string().allow('').required().messages({
    'any.required': 'Branch B code is required',
  }),
});

// @desc    Analyze merge conflict and return resolution
// @route   POST /api/conflict/analyze
// @access  Private
const analyzeConflict = async (req, res) => {
  try {
    const { baseCode, branchA, branchB } = req.body;

    // Create the DB record first as pending
    const analysis = await Analysis.create({
      userId: req.user._id,
      baseCode,
      branchA,
      branchB,
      status: 'pending',
    });

    // Run the merge conflict analyzer
    const result = await runAiMerge(baseCode, branchA, branchB);

    // Save final results
    analysis.mergedCode = result.mergedCode;
    analysis.riskScore = result.risk;
    analysis.explanation = result.reason;
    await analysis.save();

    res.json({
      success: true,
      analysis: {
        _id: analysis._id,
        baseCode: analysis.baseCode,
        branchA: analysis.branchA,
        branchB: analysis.branchB,
        mergedCode: analysis.mergedCode,
        riskScore: analysis.riskScore,
        explanation: analysis.explanation,
        status: analysis.status,
        createdAt: analysis.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  analyzeConflict,
  conflictAnalyzeSchema,
};
