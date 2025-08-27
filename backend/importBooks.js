const mongoose = require('mongoose');
const xlsx = require('xlsx');
const dotenv = require('dotenv');
const Book = require('./models/Book');

// Load environment variables
dotenv.config({ path: '../.env' });

// Connect to MongoDB
mongoose.connect("mongodb+srv://gmehostel:Rrjm16517%24mj@gmehostel.1rld3xx.mongodb.net/?retryWrites=true&w=majority&appName=gmehostel", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // 5 seconds timeout
  socketTimeoutMS: 45000, // 45 seconds timeout
}).then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to import books from Excel
const importBooks = async (filePath) => {
  try {
    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const books = xlsx.utils.sheet_to_json(worksheet);
    
    if (!books.length) {
      console.error('No books found in the Excel file');
      process.exit(1);
    }
    
    console.log(`Found ${books.length} books to import...`);
    
    let successCount = 0;
    const errors = [];
    
    // Process each book
    for (const [index, bookData] of books.entries()) {
      try {
        // Skip if required fields are missing
        if (!bookData.bookid && !bookData.title) {
          errors.push({
            row: index + 2, // +2 because of 0-based index and header row
            book: 'Unknown Book',
            error: 'Missing both bookid and title (at least one is required)'
          });
          continue;
        }
        
        // Prepare book data with defaults
        const book = new Book({
          title: bookData.title || `Book-${bookData.bookid || Date.now()}`,
          author: bookData.author === 'None' || !bookData.author ? 'Unknown' : bookData.author,
          bookId: (bookData.bookid || '').toString(),
          price: bookData.price === 'None' || !bookData.price ? 0 : Number(bookData.price) || 0,
          totalCopies: 1,
          availableCopies: 1,
          available: true
        });
        
        await book.save();
        console.log(`Imported: ${book.title} (${book.bookId}) - Author: ${book.author}, Price: ${book.price}`);
        successCount++;
      } catch (error) {
        errors.push({
          row: index + 2,
          book: bookData.title || `Row ${index + 2}`,
          error: error.message
        });
        console.error(`Error importing row ${index + 2}:`, error.message);
      }
    }
    
    console.log('\nImport Summary:');
    console.log(`- Successfully imported: ${successCount} books`);
    console.log(`- Failed to import: ${errors.length} books`);
    
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach((err, index) => {
        console.log(`${index + 1}. Row ${err.row} (${err.book}): ${err.error}`);
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
};

// Get file path from command line arguments
const filePath = process.argv[2];
if (!filePath) {
  console.error('Please provide the path to the Excel file');
  console.log('Usage: node importBooks.js path/to/your/books.xlsx');
  process.exit(1);
}

// Start the import
importBooks(filePath);
