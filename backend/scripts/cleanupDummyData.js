const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User');
const BookTransaction = require('../models/BookTransaction');
require('dotenv').config();

const cleanupDummyData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Find the dummy student 'raju'
    const rajuStudent = await User.findOne({ studentId: 'raju' });
    
    if (rajuStudent) {
      console.log(`Found dummy student: ${rajuStudent.name} (${rajuStudent.studentId})`);
      
      // Remove all transactions for this student
      const deletedTransactions = await BookTransaction.deleteMany({ 
        student: rajuStudent._id 
      });
      console.log(`Deleted ${deletedTransactions.deletedCount} transactions for student raju`);

      // Reset all books that were issued to this student
      const booksToReset = await Book.find({ currentlyIssuedTo: rajuStudent._id });
      
      for (const book of booksToReset) {
        // Reset book status to available
        book.currentlyIssuedTo = null;
        book.dateOfIssue = null;
        book.expectedReturnDate = null;
        book.available = true;
        book.availableCopies = book.totalCopies; // Reset to full availability
        await book.save();
        console.log(`Reset book: ${book.title} - now available with ${book.availableCopies} copies`);
      }

      // Optionally remove the dummy student as well
      await User.findByIdAndDelete(rajuStudent._id);
      console.log(`Deleted dummy student: ${rajuStudent.name}`);
    } else {
      console.log('Dummy student "raju" not found');
    }

    // Clean up any dummy books that were created (optional)
    const dummyBookIds = ['ALGO001', 'CODE001', 'DESIGN001', 'DB001', 'OS001'];
    
    console.log('\nCleaning up dummy books...');
    for (const bookId of dummyBookIds) {
      const book = await Book.findOne({ bookId: bookId });
      if (book) {
        // Remove any remaining transactions for this book
        await BookTransaction.deleteMany({ book: book._id });
        
        // Delete the book
        await Book.findByIdAndDelete(book._id);
        console.log(`Deleted dummy book: ${book.title} (${bookId})`);
      }
    }

    // Verify cleanup
    const remainingTransactions = await BookTransaction.countDocuments();
    const remainingBooks = await Book.countDocuments();
    const remainingStudents = await User.countDocuments({ role: 'student' });

    console.log('\n=== CLEANUP SUMMARY ===');
    console.log(`Remaining transactions: ${remainingTransactions}`);
    console.log(`Remaining books: ${remainingBooks}`);
    console.log(`Remaining students: ${remainingStudents}`);
    console.log('\nAll dummy overdue data has been successfully removed!');
    console.log('The library system is now clean and ready for real data.');

  } catch (error) {
    console.error('Error cleaning up dummy data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the cleanup script
cleanupDummyData();
