const express = require('express');
const router = express.Router();
const { acceptMerge, rejectMerge, mergeStatusSchema } = require('../controllers/mergeController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

router.post('/accept', protect, validate(mergeStatusSchema), acceptMerge);
router.post('/reject', protect, validate(mergeStatusSchema), rejectMerge);

module.exports = router;
