const mongoose = require('mongoose');

const bookTransactionSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expectedReturnDate: {
    type: Date,
    required: true
  },
  actualReturnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['issued', 'returned', 'overdue'],
    default: 'issued'
  },
  remindersSent: {
    type: Number,
    default: 0
  },
  lastReminderDate: {
    type: Date,
    default: null
  }
});

// Pre-save middleware to set expected return date (15 days from issue date)
bookTransactionSchema.pre('save', function(next) {
  if (this.isNew && !this.expectedReturnDate) {
    const issueDate = this.issueDate || new Date();
    const returnDate = new Date(issueDate);
    returnDate.setDate(returnDate.getDate() + 15); // 15 days from issue date
    this.expectedReturnDate = returnDate;
  }
  next();
});

// Method to check if transaction is overdue
bookTransactionSchema.methods.isOverdue = function() {
  if (this.status === 'returned') return false;
  
  const currentDate = new Date();
  return currentDate > this.expectedReturnDate;
};

// Method to calculate days overdue
bookTransactionSchema.methods.daysOverdue = function() {
  if (!this.isOverdue()) return 0;
  
  const currentDate = new Date();
  const timeDiff = currentDate - this.expectedReturnDate;
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
};

const BookTransaction = mongoose.model('BookTransaction', bookTransactionSchema);

module.exports = BookTransaction;