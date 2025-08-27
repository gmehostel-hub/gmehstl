const Book = require('../models/Book');
const User = require('../models/User');
const BookTransaction = require('../models/BookTransaction');
const { sendBookOverdueReminder } = require('../utils/emailService');

/**
 * @desc    Get all books
 * @route   GET /api/books
 * @access  Private
 */
exports.getBooks = async (req, res, next) => {
  try {
    // Get query parameters for filtering
    const { available, title, author, bookId } = req.query;
    
    // Build filter object
    const filter = {};
    if (available !== undefined) filter.available = available === 'true';
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (bookId) filter.bookId = bookId;
    
    const books = await Book.find(filter).sort('title');
    
    res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single book
 * @route   GET /api/books/:id
 * @access  Private
 */
exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book not found with id of ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create book
 * @route   POST /api/books
 * @access  Private/Admin
 */
exports.createBook = async (req, res, next) => {
  try {
    // Check if book with ID already exists
    const existingBook = await Book.findOne({ bookId: req.body.bookId });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: 'Book already exists with this ID'
      });
    }
    
    const book = await Book.create(req.body);
    
    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update book
 * @route   PUT /api/books/:id
 * @access  Private/Admin
 */
exports.updateBook = async (req, res, next) => {
  try {
    let book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book not found with id of ${req.params.id}`
      });
    }
    
    // Don't allow changing bookId if it's already issued
    if (req.body.bookId && req.body.bookId !== book.bookId && !book.available) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change book ID while book is issued'
      });
    }
    
    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete book
 * @route   DELETE /api/books/:id
 * @access  Private/Admin
 */
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book not found with id of ${req.params.id}`
      });
    }
    
    // Check if book is currently issued by comparing available copies to total copies
    if (book.availableCopies < book.totalCopies) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete book. ${book.totalCopies - book.availableCopies} copies are still issued.`
      });
    }
    
    await Book.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Recover a lost book
 * @route   PUT /api/books/recover/:id
 * @access  Private/Admin
 */
exports.recoverBook = async (req, res, next) => {
  try {
    const transaction = await BookTransaction.findById(req.params.id).populate('book');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Issued book record not found'
      });
    }

    if (transaction.status === 'returned' || transaction.status === 'recovered') {
      return res.status(400).json({
        success: false,
        message: 'Book has already been returned or recovered'
      });
    }

    const book = transaction.book;

    // Update transaction
    transaction.status = 'recovered';
    transaction.returnDate = new Date(); // Mark recovery date
    await transaction.save();

    // Update book availability
    book.availableCopies += 1;
    await book.save();

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

exports.issueBook = async (req, res, next) => {
  try {
    // Find book
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book not found with id of ${req.params.id}`
      });
    }
    
    // Check if book copies are available
    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No copies of this book are currently available'
      });
    }
    
    // Find student
    const student = await User.findById(req.params.studentId);
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: `Student not found with ID ${req.params.studentId}`
      });
    }
    
    // Calculate expected return date (15 days from issue date)
    const issueDate = new Date(req.body.issueDate);
    const expectedReturnDate = new Date(issueDate);
    expectedReturnDate.setDate(issueDate.getDate() + 15);
    
    // Update book status - decrement available copies
    book.availableCopies -= 1;

    // Set currentlyIssuedTo for the most recent issue (for display purposes)
    book.currentlyIssuedTo = student._id;
    book.dateOfIssue = issueDate;
    book.expectedReturnDate = expectedReturnDate;
    await book.save();
    
    // Create transaction record
    await BookTransaction.create({
      book: book._id,
      student: student._id,
      issueDate,
      expectedReturnDate,
      status: 'issued'
    });
    
    res.status(200).json({
      success: true,
      message: `Book "${book.title}" issued to ${student.name}`,
      data: {
        book,
        student: {
          _id: student._id,
          name: student.name,
          studentId: student.studentId,
          email: student.email
        },
        issueDate,
        expectedReturnDate
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Return book
 * @route   POST /api/books/:id/return
 * @access  Private/Admin
 */
exports.returnBook = async (req, res, next) => {
  try {
    const transaction = await BookTransaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Transaction not found with id of ${req.params.id}`
      });
    }

    if (transaction.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'Book has already been returned'
      });
    }

    // Update transaction
    transaction.status = 'returned';
    transaction.actualReturnDate = new Date();

    // Increment the available copies count for the book
    const book = await Book.findById(transaction.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    await transaction.save();

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get books issued to a student
 * @route   GET /api/books/student/:studentId
 * @access  Private
 */
exports.getStudentBooks = async (req, res, next) => {
  try {
    // Find student
    const student = await User.findOne({ studentId: req.params.studentId, role: 'student' });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with ID ${req.params.studentId}`
      });
    }
    
    // Get current books
    const currentBooks = await Book.find({
      currentlyIssuedTo: student._id,
      available: false
    });
    
    // Get transaction history
    const transactions = await BookTransaction.find({
      student: student._id
    })
    .populate('book')
    .sort('-issueDate');
    
    res.status(200).json({
      success: true,
      data: {
        currentBooks,
        transactions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all issued books with student details
 * @route   GET /api/books/issued
 * @access  Private
 */
exports.getIssuedBooks = async (req, res, next) => {
  try {
    const issuedTransactions = await BookTransaction.find({
      status: { $in: ['issued', 'overdue'] }
    })
    .populate('book')
    .populate('student')
    .sort('-issueDate');

    // Filter out transactions where the book or student has been deleted
    const validTransactions = issuedTransactions.filter(t => t.book && t.student);

    res.status(200).json({
      success: true,
      count: validTransactions.length,
      data: validTransactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all overdue books with student details
 * @route   GET /api/books/overdue
 * @access  Private
 */
exports.getOverdueBooks = async (req, res, next) => {
  try {
    // Get all overdue transactions
    const overdueTransactions = await BookTransaction.find({
      status: 'overdue',
      actualReturnDate: null,
      expectedReturnDate: { $lt: new Date() }
    })
    .populate({
      path: 'book',
      select: 'title author bookId category price'
    })
    .populate({
      path: 'student',
      select: 'name email studentId phoneNumber roomNumber'
    })
    .sort('-issueDate');
    
    // Format the data for frontend
    const overdueBooks = overdueTransactions.map(transaction => ({
      _id: transaction.book._id,
      title: transaction.book.title,
      author: transaction.book.author,
      bookId: transaction.book.bookId,
      category: transaction.book.category,
      price: transaction.book.price,
      available: false,
      issueDate: transaction.issueDate,
      expectedReturnDate: transaction.expectedReturnDate,
      studentName: transaction.student.name,
      studentEmail: transaction.student.email,
      studentId: transaction.student.studentId,
      roomNumber: transaction.student.roomNumber,
      phoneNumber: transaction.student.phoneNumber,
      transactionId: transaction._id,
      status: transaction.status,
      daysOverdue: Math.floor((new Date() - new Date(transaction.expectedReturnDate)) / (1000 * 60 * 60 * 24))
    }));
    
    res.status(200).json({
      success: true,
      count: overdueBooks.length,
      data: overdueBooks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check for overdue books and send reminders
 * @route   POST /api/books/check-overdue
 * @access  Private/Admin
 */
exports.checkOverdueBooks = async (req, res, next) => {
  try {
    const currentDate = new Date();
    
    // Find all overdue books
    const overdueBooks = await Book.find({
      available: false,
      expectedReturnDate: { $lt: currentDate }
    });
    
    // Find corresponding transactions
    const overdueTransactions = await BookTransaction.find({
      status: { $in: ['issued', 'overdue'] },
      expectedReturnDate: { $lt: currentDate }
    });
    
    // Update transaction status to overdue
    for (const transaction of overdueTransactions) {
      transaction.status = 'overdue';
      await transaction.save();
    }
    
    // Send reminders for each overdue book
    const remindersSent = [];
    
    for (const book of overdueBooks) {
      // Find student
      const student = await User.findById(book.currentlyIssuedTo);
      
      if (!student) continue;
      
      // Find transaction
      const transaction = await BookTransaction.findOne({
        book: book._id,
        student: student._id,
        status: 'overdue'
      });
      
      if (!transaction) continue;
      
      // Check if reminder was sent recently (within last 3 days)
      const shouldSendReminder = !transaction.lastReminderDate || 
        (currentDate - transaction.lastReminderDate) / (1000 * 60 * 60 * 24) >= 3;
      
      if (shouldSendReminder) {
        try {
          // Calculate days overdue
          const daysOverdue = Math.floor((currentDate - book.expectedReturnDate) / (1000 * 60 * 60 * 24));
          
          // Send reminder email
          await sendBookOverdueReminder({
            user: student,
            book,
            dueDate: book.expectedReturnDate,
            daysOverdue
          });
          
          // Update transaction
          transaction.remindersSent += 1;
          transaction.lastReminderDate = currentDate;
          await transaction.save();
          
          remindersSent.push({
            book: book.title,
            student: student.name,
            daysOverdue
          });
        } catch (error) {
          console.error(`Failed to send reminder for book ${book.title} to ${student.name}:`, error);
        }
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Found ${overdueBooks.length} overdue books, sent ${remindersSent.length} reminders`,
      data: {
        overdueBooks: overdueBooks.length,
        remindersSent
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get books for current user
 * @route   GET /api/books/my-books
 * @access  Private
 */
exports.sendReminder = async (req, res, next) => {
  try {
    const transaction = await BookTransaction.findById(req.params.transactionId).populate('book').populate('student');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status !== 'overdue') {
      return res.status(400).json({
        success: false,
        message: 'Book is not overdue, cannot send reminder.'
      });
    }

    const { student, book, dueDate } = transaction;

    await sendBookOverdueReminder({
      user: student,
      book,
      dueDate
    });

    transaction.remindersSent = (transaction.remindersSent || 0) + 1;
    transaction.lastReminderDate = new Date();
    await transaction.save();

    res.status(200).json({
      success: true,
      message: `Reminder sent to ${student.name} for ${book.title}`
    });

  } catch (error) {
    console.error('Error sending reminder:', error);
    next(error);
  }
};

/**
 * @desc    Mark a book as lost
 * @route   PUT /api/books/mark-lost/:id
 * @access  Private/Admin
 */
exports.markAsLost = async (req, res, next) => {
  try {
    const transaction = await BookTransaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    if (transaction.status !== 'issued' && transaction.status !== 'overdue') {
      return res.status(400).json({
        success: false,
        message: 'Only issued or overdue books can be marked as lost.',
      });
    }

    transaction.status = 'lost';
    await transaction.save();

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

exports.getMyBooks = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const transactions = await BookTransaction.find({ student: userId })
      .populate('book')
      .sort('-issueDate');

    if (!transactions) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const myBooks = transactions.map(t => {
      if (!t.book) return null; // Handle cases where book might be deleted
      return {
        _id: t._id,
        bookId: t.book.bookId,
        title: t.book.title,
        author: t.book.author,
        category: t.book.category,
        issueDate: t.issueDate,
        dueDate: t.expectedReturnDate,
        returnDate: t.returnDate,
        status: t.status
      };
    }).filter(Boolean); // Filter out any null entries

    res.status(200).json({
      success: true,
      count: myBooks.length,
      data: myBooks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get books for specific student
 * @route   GET /api/books/student/:studentId
 * @access  Private
 */