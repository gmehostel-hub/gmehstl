const express = require('express');
const { 
  getRooms, 
  getRoom, 
  getRoomByNumber, 
  getRoomStudents, 
  updateRoom, 
  assignStudentToRoom, 
  removeStudentFromRoom,
  createRoom,
  deleteRoom,
  getMyRoom,
  getMyRoommates,
  removeAllStudentsFromRooms,
  cleanOrphanedStudents
} = require('../controllers/roomController');
const { authenticate, authorize } = require('../middleware/newAuthMiddleware');

const router = express.Router();

// Apply protection to all routes
router.use(authenticate);

// Student accessible routes
router.get('/my-room', getMyRoom);
router.get('/my-roommates', getMyRoommates);

// Routes accessible to admin and warden
router.get('/', authorize('admin', 'warden'), getRooms);
router.get('/number/:roomNumber', authorize('admin', 'warden'), getRoomByNumber);
router.get('/number/:roomNumber/students', authorize('admin', 'warden'), getRoomStudents);

// Admin only routes
router.put('/clean-orphans', authorize('admin'), cleanOrphanedStudents);
router.post('/', authorize('admin'), createRoom);
router.post('/number/:roomNumber/assign/:studentId', authorize('admin'), assignStudentToRoom);
router.delete('/remove-all-students', authorize('admin'), removeAllStudentsFromRooms);
router.delete('/number/:roomNumber/remove/:studentId', authorize('admin'), removeStudentFromRoom);

// Dynamic routes should be last
router.get('/:id', authorize('admin', 'warden'), getRoom);
router.put('/:id', authorize('admin'), updateRoom);
router.delete('/:id', authorize('admin'), deleteRoom);

module.exports = router;