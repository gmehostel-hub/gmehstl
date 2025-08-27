import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatDate } from '../../utils/dateUtils';

const Library = () => {
  const [books, setBooks] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('books');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookDetails, setShowBookDetails] = useState(false);
  const [selectedBookStudent, setSelectedBookStudent] = useState(null);

  // Book categories
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'fiction', label: 'Fiction' },
    { value: 'non-fiction', label: 'Non-Fiction' },
    { value: 'science', label: 'Science' },
    { value: 'technology', label: 'Technology' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'computer-science', label: 'Computer Science' },
    { value: 'history', label: 'History' },
    { value: 'philosophy', label: 'Philosophy' },
    { value: 'literature', label: 'Literature' },
    { value: 'reference', label: 'Reference' },
    { value: 'other', label: 'Other' }
  ];

  // Availability statuses for filtering
  const availabilityStatuses = [
    { value: 'all', label: 'All Books' },
    { value: 'available', label: 'Available' },
    { value: 'unavailable', label: 'Unavailable' }
  ];

  useEffect(() => {
    fetchAllLibraryData();
  }, []);

  const fetchAllLibraryData = async () => {
    try {
      setLoading(true);
      console.log('Fetching library data for warden...');
      
      // Initialize with empty arrays
      let booksData = [];
      let issuedBooksData = [];
      let overdueBooksData = [];
      
      // Fetch books data
      try {
        console.log('Fetching books from /api/books...');
        const booksResponse = await api.get('/api/books');
        console.log('Books response:', booksResponse.status, booksResponse.data);
        booksData = booksResponse.data.data || booksResponse.data || [];
        console.log('Books loaded successfully:', booksData.length, 'items');
      } catch (booksError) {
        console.error('Error fetching books:', booksError);
        console.error('Books error response:', booksError.response?.status, booksError.response?.data);
        // Continue with other API calls even if books fail
      }
      
      // Fetch issued books data
      try {
        console.log('Fetching issued books from /api/books/issued...');
        const issuedResponse = await api.get('/api/books/issued');
        console.log('Issued books response:', issuedResponse.status, issuedResponse.data);
        issuedBooksData = issuedResponse.data.data || issuedResponse.data || [];
        console.log('Issued books loaded successfully:', issuedBooksData.length, 'items');
      } catch (issuedError) {
        console.error('Error fetching issued books:', issuedError);
        console.error('Issued books error response:', issuedError.response?.status, issuedError.response?.data);
        // Continue with other API calls even if issued books fail
      }
      
      // Fetch overdue books data
      try {
        console.log('Fetching overdue books from /api/books/overdue...');
        const overdueResponse = await api.get('/api/books/overdue');
        console.log('Overdue books response:', overdueResponse.status, overdueResponse.data);
        overdueBooksData = overdueResponse.data.data || overdueResponse.data || [];
        console.log('Overdue books loaded successfully:', overdueBooksData.length, 'items');
      } catch (overdueError) {
        console.error('Error fetching overdue books:', overdueError);
        console.error('Overdue books error response:', overdueError.response?.status, overdueError.response?.data);
        // Continue even if overdue books fail
      }
      
      // Set all the data from the responses
      setBooks(booksData);
      setIssuedBooks(issuedBooksData);
      setOverdueBooks(overdueBooksData);
      
      console.log('All library data processing completed:', {
        books: booksData.length,
        issued: issuedBooksData.length,
        overdue: overdueBooksData.length
      });
      
      setError(null);
    } catch (err) {
      console.error('Unexpected error in fetchAllLibraryData:', err);
      setError(`Failed to load library data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openBookDetails = (book) => {
    setSelectedBook(book);
    setShowBookDetails(true);
    
    // Use student data from issued books if available, or find from issued books list
    if (book.currentlyIssuedTo) {
      // Check if this book has student data already (from issued books)
      if (book.studentName) {
        setSelectedBookStudent({
          name: book.studentName,
          studentId: book.studentId || 'N/A',
          email: book.studentEmail,
          roomNumber: book.roomNumber,
          phoneNumber: book.phoneNumber
        });
      } else {
        // Find student data from issued books list
        const issuedBook = issuedBooks.find(ib => ib._id === book._id || ib.bookId === book.bookId);
        if (issuedBook && issuedBook.studentName) {
          setSelectedBookStudent({
            name: issuedBook.studentName,
            studentId: issuedBook.studentId || 'N/A',
            email: issuedBook.studentEmail,
            roomNumber: issuedBook.roomNumber,
            phoneNumber: issuedBook.phoneNumber
          });
        } else {
          setSelectedBookStudent(null);
        }
      }
    } else {
      setSelectedBookStudent(null);
    }
  };

  const closeBookDetails = () => {
    setShowBookDetails(false);
    setSelectedBook(null);
    setSelectedBookStudent(null);
  };

  // Filter books based on search term, category, and availability
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.bookId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || book.category === filterCategory;
    const matchesAvailability = filterAvailability === 'all' || 
                               (filterAvailability === 'available' && book.available) ||
                               (filterAvailability === 'unavailable' && !book.available);
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  // Calculate library statistics
  const libraryStats = {
    totalBooks: books.length,
    availableBooks: books.filter(book => book.available).length,
    issuedBooks: issuedBooks.length,
    overdueBooks: overdueBooks.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with statistics */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Library Overview</h2>
            <p className="text-gray-600">View all library books, issued books, and overdue items</p>
          </div>
        </div>
        
        {/* Library Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{libraryStats.totalBooks}</div>
            <div className="text-sm text-blue-600">Total Books</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{libraryStats.availableBooks}</div>
            <div className="text-sm text-green-600">Available</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{libraryStats.issuedBooks}</div>
            <div className="text-sm text-yellow-600">Issued</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{libraryStats.overdueBooks}</div>
            <div className="text-sm text-red-600">Overdue</div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveView('books')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeView === 'books'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Books ({books.length})
          </button>
          <button
            onClick={() => setActiveView('issued')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeView === 'issued'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Issued Books ({issuedBooks.length})
          </button>
          <button
            onClick={() => setActiveView('overdue')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeView === 'overdue'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Overdue Books ({overdueBooks.length})
          </button>
        </div>

        {/* Search and Filters (only for books view) */}
        {activeView === 'books' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Books</label>
              <input
                type="text"
                id="search"
                placeholder="Title, author, or book ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
              <select
                id="filterCategory"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="filterAvailability" className="block text-sm font-medium text-gray-700 mb-1">Filter by Availability</label>
              <select
                id="filterAvailability"
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                {availabilityStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content based on active view */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {activeView === 'books' && (
          <>
            <div className="px-4 py-5 sm:px-6 bg-primary-600 text-white">
              <h3 className="text-lg leading-6 font-medium">All Books ({filteredBooks.length})</h3>
              <p className="mt-1 max-w-2xl text-sm">Click on any book to view detailed information</p>
            </div>
            
            {filteredBooks.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <i className="fas fa-book text-4xl mb-4"></i>
                <p>No books found matching your criteria.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredBooks.map((book) => (
                  <div
                    key={book._id}
                    onClick={() => openBookDetails(book)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900">{book.title}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            book.available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {book.available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">by {book.author}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>
                            <i className="fas fa-tag mr-1"></i>
                            ID: {book.bookId}
                          </span>
                          <span>
                            <i className="fas fa-folder mr-1"></i>
                            {book.category}
                          </span>
                          <span>
                            <i className="fas fa-rupee-sign mr-1"></i>
                            ₹{book.price}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-chevron-right text-gray-400"></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeView === 'issued' && (
          <>
            <div className="px-4 py-5 sm:px-6 bg-primary-600 text-white">
              <h3 className="text-lg leading-6 font-medium">Issued Books ({issuedBooks.length})</h3>
              <p className="mt-1 max-w-2xl text-sm">Books currently issued to students</p>
            </div>
            
            {issuedBooks.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <i className="fas fa-book-open text-4xl mb-4"></i>
                <p>No books are currently issued.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Return</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {issuedBooks.map((book) => (
                      <tr key={book._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{book.title}</div>
                            <div className="text-sm text-gray-500">by {book.author}</div>
                            <div className="text-sm text-gray-500">ID: {book.bookId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{book.studentName || 'Unknown Student'}</div>
                            <div className="text-sm text-gray-500">{book.studentEmail || 'N/A'}</div>
                            <div className="text-sm text-gray-500">Room: {book.roomNumber || 'N/A'}</div>
                            <div className="text-sm text-gray-500">Phone: {book.phoneNumber || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(book.issueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(book.expectedReturnDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeView === 'overdue' && (
          <>
            <div className="px-4 py-5 sm:px-6 bg-red-600 text-white">
              <h3 className="text-lg leading-6 font-medium">Overdue Books ({overdueBooks.length})</h3>
              <p className="mt-1 max-w-2xl text-sm">Books that are past their return date</p>
            </div>
            
            {overdueBooks.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <i className="fas fa-check-circle text-4xl mb-4 text-green-500"></i>
                <p>No overdue books. Great!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Return</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Overdue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {overdueBooks.map((book) => {
                      const daysOverdue = book.expectedReturnDate 
                        ? Math.floor((new Date() - new Date(book.expectedReturnDate)) / (1000 * 60 * 60 * 24))
                        : 0;
                      
                      return (
                        <tr key={book._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{book.title}</div>
                              <div className="text-sm text-gray-500">by {book.author}</div>
                              <div className="text-sm text-gray-500">ID: {book.bookId}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{book.studentName || 'Unknown Student'}</div>
                              <div className="text-sm text-gray-500">{book.studentEmail || 'N/A'}</div>
                              <div className="text-sm text-gray-500">Room: {book.roomNumber || 'N/A'}</div>
                              <div className="text-sm text-gray-500">Phone: {book.phoneNumber || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(book.issueDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(book.expectedReturnDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {daysOverdue} days
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Book Details Popup Modal */}
      {showBookDetails && selectedBook && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={closeBookDetails}>
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Book Details</h3>
              <button
                onClick={closeBookDetails}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBook.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Author</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBook.author}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Book ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBook.bookId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBook.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <p className="mt-1 text-sm text-gray-900">₹{selectedBook.price}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Availability</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedBook.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedBook.available ? 'Available' : 'Unavailable'}
                    </span>
                  </p>
                </div>
              </div>
              
              {selectedBook.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBook.description}</p>
                </div>
              )}
              
              {!selectedBook.available && selectedBook.currentlyIssuedTo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Currently Issued To</label>
                  {selectedBookStudent ? (
                    <div className="mt-1 space-y-1">
                      <p className="text-sm font-medium text-gray-900">{selectedBookStudent.name}</p>
                      <p className="text-sm text-gray-600">ID: {selectedBookStudent.studentId}</p>
                      <p className="text-sm text-gray-600">Email: {selectedBookStudent.email}</p>
                      <p className="text-sm text-gray-600">Room: {selectedBookStudent.roomNumber || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Phone: {selectedBookStudent.phoneNumber || 'N/A'}</p>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">Loading student details...</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeBookDetails}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
