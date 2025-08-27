const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User');
const BookTransaction = require('../models/BookTransaction');
require('dotenv').config();

const seedOverdueBooks = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // First, let's find or create student 'raju'
    let rajuStudent = await User.findOne({ studentId: 'raju' });
    
    if (!rajuStudent) {
      // Create student raju if doesn't exist
      rajuStudent = new User({
        name: 'Raju Kumar',
        email: 'raju@example.com',
        studentId: 'raju',
        role: 'student',
        password: '12345678', // Will be hashed by pre-save middleware
        phoneNumber: '9876543210',
        year: 2,
        branch: 'Computer Science',
        college: 'ABC Engineering College',
        roomNumber: 101
      });
      await rajuStudent.save();
      console.log('Created student raju');
    } else {
      console.log('Student raju already exists');
    }

    // Create some sample books if they don't exist
    const sampleBooks = [
      {
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        bookId: 'ALGO001',
        category: 'Computer Science',
        price: 899,
        totalCopies: 3,
        availableCopies: 1,
        available: true,
        description: 'Comprehensive guide to algorithms and data structures'
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        bookId: 'CODE001',
        category: 'Programming',
        price: 650,
        totalCopies: 2,
        availableCopies: 0,
        available: false,
        description: 'A handbook of agile software craftsmanship'
      },
      {
        title: 'Design Patterns',
        author: 'Gang of Four',
        bookId: 'DESIGN001',
        category: 'Software Engineering',
        price: 750,
        totalCopies: 2,
        availableCopies: 0,
        available: false,
        description: 'Elements of reusable object-oriented software'
      },
      {
        title: 'Database System Concepts',
        author: 'Abraham Silberschatz',
        bookId: 'DB001',
        category: 'Database',
        price: 950,
        totalCopies: 3,
        availableCopies: 1,
        available: true,
        description: 'Comprehensive database management systems textbook'
      },
      {
        title: 'Operating System Concepts',
        author: 'Abraham Silberschatz',
        bookId: 'OS001',
        category: 'Operating Systems',
        price: 850,
        totalCopies: 2,
        availableCopies: 0,
        available: false,
        description: 'Modern operating systems principles and practice'
      }
    ];

    // Insert books if they don't exist
    for (const bookData of sampleBooks) {
      const existingBook = await Book.findOne({ bookId: bookData.bookId });
      if (!existingBook) {
        const book = new Book(bookData);
        await book.save();
        console.log(`Created book: ${bookData.title}`);
      } else {
        console.log(`Book already exists: ${bookData.title}`);
      }
    }

    // Get all books for creating transactions
    const books = await Book.find({});
    
    // Create overdue transactions for raju
    const currentDate = new Date();
    
    // Create overdue transactions (books issued in the past with expected return dates that have passed)
    const overdueTransactions = [
      {
        book: books.find(b => b.bookId === 'CODE001')?._id,
        student: rajuStudent._id,
        studentId: rajuStudent.studentId,
        issueDate: new Date(currentDate.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        expectedReturnDate: new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000), // Expected 6 days ago
        status: 'issued' // Still issued, making it overdue
      },
      {
        book: books.find(b => b.bookId === 'DESIGN001')?._id,
        student: rajuStudent._id,
        studentId: rajuStudent.studentId,
        issueDate: new Date(currentDate.getTime() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
        expectedReturnDate: new Date(currentDate.getTime() - 11 * 24 * 60 * 60 * 1000), // Expected 11 days ago
        status: 'issued' // Still issued, making it overdue
      },
      {
        book: books.find(b => b.bookId === 'OS001')?._id,
        student: rajuStudent._id,
        studentId: rajuStudent.studentId,
        issueDate: new Date(currentDate.getTime() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
        expectedReturnDate: new Date(currentDate.getTime() - 4 * 24 * 60 * 60 * 1000), // Expected 4 days ago
        status: 'issued' // Still issued, making it overdue
      }
    ];

    // Insert overdue transactions
    for (const transactionData of overdueTransactions) {
      if (transactionData.book) {
        // Check if transaction already exists
        const existingTransaction = await BookTransaction.findOne({
          book: transactionData.book,
          student: transactionData.student,
          status: 'issued'
        });

        if (!existingTransaction) {
          const transaction = new BookTransaction(transactionData);
          await transaction.save();
          
          // Update book status to reflect it's currently issued to raju
          await Book.findByIdAndUpdate(transactionData.book, {
            currentlyIssuedTo: rajuStudent._id,
            dateOfIssue: transactionData.issueDate,
            expectedReturnDate: transactionData.expectedReturnDate,
            available: false,
            availableCopies: 0
          });
          
          console.log(`Created overdue transaction for book: ${books.find(b => b._id.equals(transactionData.book))?.title}`);
        } else {
          console.log(`Overdue transaction already exists for book: ${books.find(b => b._id.equals(transactionData.book))?.title}`);
        }
      }
    }

    // Create one currently issued book (not overdue yet)
    const currentTransaction = {
      book: books.find(b => b.bookId === 'ALGO001')?._id,
      student: rajuStudent._id,
      studentId: rajuStudent.studentId,
      issueDate: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      expectedReturnDate: new Date(currentDate.getTime() + 9 * 24 * 60 * 60 * 1000), // Expected in 9 days
      status: 'issued' // Currently issued, not overdue
    };

    if (currentTransaction.book) {
      const existingCurrentTransaction = await BookTransaction.findOne({
        book: currentTransaction.book,
        student: currentTransaction.student,
        status: 'issued'
      });

      if (!existingCurrentTransaction) {
        const transaction = new BookTransaction(currentTransaction);
        await transaction.save();
        
        // Update book status
        await Book.findByIdAndUpdate(currentTransaction.book, {
          currentlyIssuedTo: rajuStudent._id,
          dateOfIssue: currentTransaction.issueDate,
          expectedReturnDate: currentTransaction.expectedReturnDate,
          available: false,
          availableCopies: 2 // Still has 2 copies available
        });
        
        console.log(`Created current transaction for book: ${books.find(b => b._id.equals(currentTransaction.book))?.title}`);
      } else {
        console.log(`Current transaction already exists for book: ${books.find(b => b._id.equals(currentTransaction.book))?.title}`);
      }
    }

    // Add some returned transactions for history
    const returnedTransaction = {
      book: books.find(b => b.bookId === 'DB001')?._id,
      student: rajuStudent._id,
      studentId: rajuStudent.studentId,
      issueDate: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      expectedReturnDate: new Date(currentDate.getTime() - 16 * 24 * 60 * 60 * 1000), // Expected 16 days ago
      actualReturnDate: new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000), // Returned 15 days ago
      status: 'returned'
    };

    if (returnedTransaction.book) {
      const existingReturnedTransaction = await BookTransaction.findOne({
        book: returnedTransaction.book,
        student: returnedTransaction.student,
        actualReturnDate: { $exists: true }
      });

      if (!existingReturnedTransaction) {
        const transaction = new BookTransaction(returnedTransaction);
        await transaction.save();
        console.log(`Created returned transaction for book: ${books.find(b => b._id.equals(returnedTransaction.book))?.title}`);
      } else {
        console.log(`Returned transaction already exists for book: ${books.find(b => b._id.equals(returnedTransaction.book))?.title}`);
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Student: ${rajuStudent.name} (${rajuStudent.studentId})`);
    console.log('Created overdue books for testing:');
    console.log('1. Clean Code - 6 days overdue');
    console.log('2. Design Patterns - 11 days overdue');
    console.log('3. Operating System Concepts - 4 days overdue');
    console.log('4. Introduction to Algorithms - Currently issued (not overdue)');
    console.log('5. Database System Concepts - Previously returned');
    console.log('\nYou can now test the overdue books functionality in the admin panel!');

  } catch (error) {
    console.error('Error seeding overdue books:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeding script
seedOverdueBooks();
