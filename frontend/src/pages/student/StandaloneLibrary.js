import React, { useState, useEffect } from 'react';
import simpleApi from '../../utils/simpleApi';

const StandaloneLibrary = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('catalog');
  const [books, setBooks] = useState([]);
  const [currentBooks, setCurrentBooks] = useState([]);
  const [historyBooks, setHistoryBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookDetails, setShowBookDetails] = useState(false);
  const [myBooksTab, setMyBooksTab] = useState('current');

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
    // Session persistence - stay on this page on refresh
    sessionStorage.setItem('lastVisitedPath', '/student/library');
    
    const fetchUserAndBooks = async () => {
      try {
        setLoading(true);
        
        // Get user from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Fetch all books
          const booksResponse = await simpleApi.get('/api/books');
          if (booksResponse.data.success) {
            setBooks(booksResponse.data.data || []);
          }
          
          // Fetch user's books if they have a studentId
          if (parsedUser.studentId) {
            const myBooksResponse = await simpleApi.get(`/api/books/student/${parsedUser.studentId}`);
            if (myBooksResponse.data.success) {
              const { currentBooks, transactions } = myBooksResponse.data.data;
              setCurrentBooks(currentBooks || []);
              setHistoryBooks(transactions || []);
            }
          }
        } else {
          setError('User not found. Please log in again.');
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndBooks();
  }, []);

  // Calculate days remaining or overdue
  const calculateDaysStatus = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { days: Math.abs(diffDays), isOverdue: true };
    } else {
      return { days: diffDays, isOverdue: false };
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleViewBookDetails = (book) => {
    setSelectedBook(book);
    setShowBookDetails(true);
  };

  const handleCloseBookDetails = () => {
    setShowBookDetails(false);
    setSelectedBook(null);
  };

  // Filter books based on selected filters and search term
  const filteredBooks = books.filter(book => {
    let matchesAvailability = true;
    if (filterAvailability === 'available') {
      matchesAvailability = book.available;
    } else if (filterAvailability === 'unavailable') {
      matchesAvailability = !book.available;
    }
    
    const matchesSearch = searchTerm === '' || 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (book.bookId && book.bookId.includes(searchTerm));
    
    return matchesAvailability && matchesSearch;
  });

  if (loading && books.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error && books.length === 0) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800">Library</h2>
        <p className="text-gray-600">Browse and search for books in the library</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'catalog'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-book mr-2"></i>
              Library Catalog
            </button>
            <button
              onClick={() => setActiveTab('mybooks')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'mybooks'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-user-book mr-2"></i>
              My Books
            </button>
          </nav>
        </div>
      </div>

      {/* Book Details Modal */}
      {showBookDetails && selectedBook && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Book Details
                </h3>
                <button
                  onClick={handleCloseBookDetails}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {/* Modal Content */}
              <div className="mt-4 space-y-4">
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
                    <p className="mt-1 text-sm text-gray-900 capitalize">
                      {selectedBook.category ? selectedBook.category.replace('-', ' ') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <p className="mt-1 text-sm text-gray-900">₹{selectedBook.price}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedBook.available ? (
                        <span className="text-green-600">Available</span>
                      ) : (
                        <span className="text-red-600">Currently Unavailable</span>
                      )}
                    </p>
                  </div>
                </div>

                {selectedBook.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-600">{selectedBook.description}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseBookDetails}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'catalog' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="w-full md:w-1/2">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-search text-gray-400"></i>
                  </div>
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by title, author, or book ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Removed category filter dropdown */}
                <select
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  {availabilityStatuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Books Grid */}
          <div className="p-6">
            {filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <div 
                    key={book._id} 
                    className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-lg font-medium text-gray-900 truncate">{book.title}</h3>
                      <p className="text-sm text-gray-500">{book.author}</p>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-500">Book ID: {book.bookId}</span>
                        <span className="text-sm text-gray-500">₹{book.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm capitalize">
                          {book.category ? book.category.replace('-', ' ') : 'N/A'}
                        </span>
                        {book.available ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Available</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Unavailable</span>
                        )}
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <button
                        onClick={() => handleViewBookDetails(book)}
                        className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No books found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Books Section */}
      {activeTab === 'mybooks' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* My Books Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex px-6">
              <button
                onClick={() => setMyBooksTab('current')}
                className={`py-3 px-4 border-b-2 font-medium text-sm ${
                  myBooksTab === 'current'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-book-open mr-2"></i>
                Currently Issued ({currentBooks.length})
              </button>
              <button
                onClick={() => setMyBooksTab('history')}
                className={`py-3 px-4 border-b-2 font-medium text-sm ${
                  myBooksTab === 'history'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-history mr-2"></i>
                Transaction History ({historyBooks.length})
              </button>
            </nav>
          </div>

          {/* My Books Content */}
          <div className="p-6">
            {myBooksTab === 'current' && (
              <div>
                {currentBooks.length > 0 ? (
                  <div className="grid gap-4">
                    {currentBooks.map((book) => {
                      const daysStatus = calculateDaysStatus(book.dueDate);
                      return (
                        <div key={book._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                              <p className="text-gray-600">by {book.author}</p>
                              <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                                <span>Book ID: {book.bookId}</span>
                                <span>Issued: {formatDate(book.issueDate)}</span>
                                <span>Due: {formatDate(book.dueDate)}</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              {daysStatus.isOverdue ? (
                                <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800">
                                  Overdue by {daysStatus.days} days
                                </span>
                              ) : (
                                <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                                  {daysStatus.days} days remaining
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-book text-4xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500">You don't have any books currently issued.</p>
                  </div>
                )}
              </div>
            )}

            {myBooksTab === 'history' && (
              <div>
                {historyBooks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Book Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Issue Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Return Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {historyBooks.map((transaction) => (
                          <tr key={transaction._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {transaction.book?.title || 'Unknown Book'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  by {transaction.book?.author || 'Unknown Author'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  ID: {transaction.book?.bookId || 'N/A'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(transaction.issueDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(transaction.expectedReturnDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.actualReturnDate ? formatDate(transaction.actualReturnDate) : 'Not returned'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                transaction.status === 'returned'
                                  ? 'bg-green-100 text-green-800'
                                  : transaction.status === 'overdue'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {transaction.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-history text-4xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500">No transaction history available.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StandaloneLibrary; 