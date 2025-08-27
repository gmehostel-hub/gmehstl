const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  bookId: {
    type: String,
    required: [true, 'Book ID is required'],
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Book price is required'],
    min: 0
  },
  available: {
    type: Boolean,
    default: true
  },
  totalCopies: {
    type: Number,
    required: [true, 'Total number of copies is required'],
    min: 1,
    default: 1
  },
  availableCopies: {
    type: Number,
    required: [true, 'Available copies count is required'],
    min: 0,
    default: 1
  },
  currentlyIssuedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  dateOfIssue: {
    type: Date,
    default: null
  },
  expectedReturnDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Method to check if book is overdue
bookSchema.methods.isOverdue = function() {
  if (!this.dateOfIssue || !this.expectedReturnDate) return false;
  
  const currentDate = new Date();
  return currentDate > this.expectedReturnDate;
};

// Method to calculate days overdue
bookSchema.methods.daysOverdue = function() {
  if (!this.isOverdue()) return 0;
  
  const currentDate = new Date();
  const timeDiff = currentDate - this.expectedReturnDate;
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
};

// Pre-save hook to ensure data consistency
bookSchema.pre('save', function(next) {
  // Sync available status with copies
  if (this.isModified('availableCopies') || this.isModified('totalCopies')) {
    this.available = this.availableCopies > 0;
  }

  // Validate copy counts
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  if (this.availableCopies < 0) {
    this.availableCopies = 0;
  }

  // Update timestamp
  this.updatedAt = new Date();
  next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;