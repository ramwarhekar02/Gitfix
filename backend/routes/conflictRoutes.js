const express = require('express');
const router = express.Router();
const { analyzeConflict, conflictAnalyzeSchema } = require('../controllers/conflictController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, validate(conflictAnalyzeSchema), analyzeConflict);

module.exports = router;
