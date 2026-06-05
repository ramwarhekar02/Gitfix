const Joi = require('joi');
const Analysis = require('../models/Analysis');

const mergeStatusSchema = Joi.object({
  analysisId: Joi.string().required().messages({
    'any.required': 'Analysis ID is required',
  }),
});

// @desc    Accept resolved merge code
// @route   POST /api/merge/accept
// @access  Private
const acceptMerge = async (req, res) => {
  try {
    const { analysisId } = req.body;
    const analysis = await Analysis.findOne({ _id: analysisId, userId: req.user._id });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Resolution record not found or unauthorized' });
    }

    analysis.status = 'accepted';
    await analysis.save();

    res.json({ success: true, message: 'Merge resolution accepted', analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject resolved merge code
// @route   POST /api/merge/reject
// @access  Private
const rejectMerge = async (req, res) => {
  try {
    const { analysisId } = req.body;
    const analysis = await Analysis.findOne({ _id: analysisId, userId: req.user._id });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Resolution record not found or unauthorized' });
    }

    analysis.status = 'rejected';
    await analysis.save();

    res.json({ success: true, message: 'Merge resolution rejected', analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  acceptMerge,
  rejectMerge,
  mergeStatusSchema,
};
