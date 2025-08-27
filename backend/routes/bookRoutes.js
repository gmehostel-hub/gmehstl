const express = require('express');
const { 
  getBooks, 
  getBook, 
  createBook, 
  updateBook, 
  deleteBook, 
  issueBook, 
  returnBook, 
  recoverBook,
  getStudentBooks, 
  getMyBooks,
  getIssuedBooks,
  getOverdueBooks,
  checkOverdueBooks,
  sendReminder,
  markAsLost,
} = require('../controllers/bookController');
const { authenticate, authorize } = require('../middleware/newAuthMiddleware');

const router = express.Router();

// Apply protection to all routes
router.use(authenticate);

// Routes accessible to all authenticated users
router.get('/', getBooks);
router.get('/issued', getIssuedBooks);
router.get('/overdue', getOverdueBooks);
router.get('/my-books', getMyBooks);
router.get('/:id', getBook);

// Routes for student book management
router.get('/student/:studentId', getStudentBooks);

// Admin only routes
router.post('/', authorize('admin'), createBook);
router.put('/:id', authorize('admin'), updateBook);
router.delete('/:id', authorize('admin'), deleteBook);
router.post('/:id/issue/:studentId', authorize('admin'), issueBook);
router.put('/return/:id', authorize('admin'), returnBook);
router.put('/mark-lost/:id', authorize('admin'), markAsLost);
router.put('/recover/:id', authorize('admin'), recoverBook);
router.post('/check-overdue', authorize('admin'), checkOverdueBooks);
router.post('/remind/:transactionId', authorize('admin'), sendReminder);

module.exports = router;