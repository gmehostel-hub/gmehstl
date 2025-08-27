const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticate, authorize } = require('../middleware/newAuthMiddleware');

// Create a new feedback - any authenticated user
router.post('/', authenticate, feedbackController.createFeedback);

// Get all feedbacks - admin and warden (both can see all feedback)
router.get('/', authenticate, authorize('admin', 'warden'), feedbackController.getAllFeedbacks);

// Get feedback statistics - admin and warden
router.get('/stats', authenticate, authorize('admin', 'warden'), feedbackController.getFeedbackStats);

// Get feedbacks for current user (students can see their own feedback)
router.get('/my-feedbacks', authenticate, feedbackController.getMyFeedbacks);

// Get a specific feedback by ID
router.get('/:id', authenticate, feedbackController.getFeedbackById);

// Respond to a feedback - admin and warden only
router.post('/:id/respond', authenticate, authorize('admin', 'warden'), feedbackController.respondToFeedback);

// Mark feedback as resolved/unresolved - admin and warden only
router.patch('/:id/resolve', authenticate, authorize('admin', 'warden'), feedbackController.markFeedbackResolved);

// Delete a feedback - admin only or the student who created it
router.delete('/:id', authenticate, feedbackController.deleteFeedback);

module.exports = router;