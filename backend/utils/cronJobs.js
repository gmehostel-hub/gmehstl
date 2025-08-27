const cron = require('node-cron');
const Book = require('../models/Book');
const User = require('../models/User');
const BookTransaction = require('../models/BookTransaction');
const { sendBookOverdueReminder } = require('./emailService');

/**
 * Schedule a daily job to check for overdue books and send reminders
 */
exports.scheduleOverdueBookReminders = () => {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily check for overdue books...');
    
    try {
      const currentDate = new Date();
      
      // Find all overdue books
      const overdueBooks = await Book.find({
        available: false,
        expectedReturnDate: { $lt: currentDate }
      });
      
      console.log(`Found ${overdueBooks.length} overdue books`);
      
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
      let remindersSent = 0;
      
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
            
            remindersSent++;
            console.log(`Sent reminder to ${student.name} for book "${book.title}" (${daysOverdue} days overdue)`);
          } catch (error) {
            console.error(`Failed to send reminder for book ${book.title} to ${student.name}:`, error);
          }
        }
      }
      
      console.log(`Sent ${remindersSent} reminders for overdue books`);
    } catch (error) {
      console.error('Error in overdue book reminder job:', error);
    }
  });
  
  console.log('Scheduled daily overdue book reminder job');
};