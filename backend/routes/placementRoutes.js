const express = require('express');
const { 
  getPlacements, 
  getPlacement, 
  getPlacementByStudentId, 
  createPlacement, 
  updatePlacement, 
  deletePlacement, 
  getPlacementStats, 
  getMyPlacement 
} = require('../controllers/placementController');
const { authenticate, authorize } = require('../middleware/newAuthMiddleware');

const router = express.Router();

// Apply protection to all routes
router.use(authenticate);

// Admin, warden, and students can view placements, only admin can create/modify
router.route('/')
  .get(authorize('admin', 'warden', 'student'), getPlacements)
  .post(authorize('admin'), createPlacement);

router.get('/stats', authorize('admin', 'warden', 'student'), getPlacementStats);

// Student routes to get their own placement (must come before /:id route)
router.get('/me', authorize('student'), getMyPlacement);
router.get('/my-placements', authorize('student'), getMyPlacement);

// Routes accessible to all authenticated users
router.get('/student/:studentId', getPlacementByStudentId);

router.route('/:id')
  .get(authorize('admin'), getPlacement)
  .put(authorize('admin'), updatePlacement)
  .delete(authorize('admin'), deletePlacement);

module.exports = router;