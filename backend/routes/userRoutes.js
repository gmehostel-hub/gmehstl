const express = require('express');
const { getMe, getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/newAuthMiddleware');

const router = express.Router();

// Apply protection to all routes
router.use(authenticate);

router.get('/me', getMe);

// Admin and warden can view users, only admin can create
router.route('/')
  .get(authorize('admin', 'warden'), getUsers)
  .post(authorize('admin'), createUser);

router.route('/:id')
  .get(authorize('admin', 'warden'), getUser)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

module.exports = router;