const mongoose = require('mongoose');
const xlsx = require('xlsx');
const dotenv = require('dotenv');
const Book = require('./backend/models/Book');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to import books from Excel
const importBooks = async (filePath) => {
  try {
    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const books = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${books.length} books to import...`);
    
    let successCount = 0;
    const errors = [];
    
    // Process each book
    for (const bookData of books) {
      try {
        // Skip if required fields are missing
        if (!bookData.bookid || !bookData.title) {
          errors.push({
            book: bookData.title || 'Unknown Book',
            error: 'Missing required fields (bookid and title are required)'
          });
          continue;
        }
        
        // Prepare book data with defaults
        const book = new Book({
          title: bookData.title,
          author: bookData.author === 'None' || !bookData.author ? 'Unknown' : bookData.author,
          bookId: bookData.bookid.toString(), // Convert to string in case it's a number
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
          book: bookData.title || 'Unknown Book',
          error: error.message
        });
        console.error(`Error importing ${bookData.title || 'a book'}:`, error.message);
      }
    }
    
    console.log('\nImport Summary:');
    console.log(`- Successfully imported: ${successCount} books`);
    console.log(`- Failed to import: ${errors.length} books`);
    
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach((err, index) => {
        console.log(`${index + 1}. ${err.book}: ${err.error}`);
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
};

// Check if file path is provided
const filePath = process.argv[2];
if (!filePath) {
  console.error('Please provide the path to the Excel file');
  console.log('Usage: node importBooks.js path/to/your/Book1.xlsx');
  process.exit(1);
}

// Start the import
importBooks(filePath);
