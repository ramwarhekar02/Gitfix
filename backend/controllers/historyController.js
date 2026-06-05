const Analysis = require('../models/Analysis');

// @desc    Get current user's merge resolution history
// @route   GET /api/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const history = await Analysis.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getHistory };
