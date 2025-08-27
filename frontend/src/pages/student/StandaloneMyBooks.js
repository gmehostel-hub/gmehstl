import React, { useState, useEffect } from 'react';
import simpleApi from '../../utils/simpleApi';

const StandaloneMyBooks = () => {
  const [user, setUser] = useState(null);
  const [currentBooks, setCurrentBooks] = useState([]);
  const [historyBooks, setHistoryBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    // Session persistence - stay on this page on refresh
    sessionStorage.setItem('lastVisitedPath', '/my-books');
    
    const fetchUserAndBooks = async () => {
      try {
        setLoading(true);
        
        // Get user from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          const response = await simpleApi.get('/api/books/my-books');

          if (response.data.success) {
            const allBooks = response.data.data || [];
            
            // Filter for currently issued books
            const currentlyIssued = allBooks.filter(book => book.status === 'issued' || book.status === 'overdue');
            setCurrentBooks(currentlyIssued);
            
            // All transactions are history
            setHistoryBooks(allBooks);
          }
        } else {
          setError('User not found. Please log in again.');
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load your books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndBooks();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Calculate days remaining or overdue
  const calculateDaysStatus = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { days: Math.abs(diffDays), isOverdue: true };
    }
    
    return { days: diffDays, isOverdue: false };
  };

  // Check if book is overdue
  const isBookOverdue = (book) => {
    if (!book.expectedReturnDate) return false;
    return new Date(book.expectedReturnDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
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
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">My Library</h2>
        <p className="text-gray-600">
          You currently have {currentBooks.length} book{currentBooks.length !== 1 ? 's' : ''} issued.
          {currentBooks.some(book => isBookOverdue(book)) && 
            ' Some books are overdue. Please return them as soon as possible to avoid penalties.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'current' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('current')}
            >
              Current Books
            </button>
            <button
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
          </nav>
        </div>

        {/* Current Books Tab */}
        {activeTab === 'current' && (
          <div className="p-4">
            {currentBooks.length > 0 ? (
              <div className="space-y-4">
                {currentBooks.map((book) => {
                  const isOverdue = isBookOverdue(book);
                  const { days } = book.expectedReturnDate ? calculateDaysStatus(book.expectedReturnDate) : { days: 0 };
                  return (
                    <div key={book._id} className="border rounded-lg overflow-hidden">
                      <div className={`p-4 ${isOverdue ? 'bg-red-50' : 'bg-white'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-gray-900">{book.title}</h4>
                            <p className="text-sm text-gray-600">by {book.author}</p>
                            <p className="text-sm text-gray-500 mt-1">Book ID: {book.bookId}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isOverdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {isOverdue ? 'Overdue' : 'Issued'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Issue Date</p>
                            <p className="font-medium">{formatDate(book.dateOfIssue)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Due Date</p>
                            <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                              {formatDate(book.expectedReturnDate)}
                            </p>
                          </div>
                        </div>
                        
                        {isOverdue && (
                          <div className="mt-3 p-3 bg-red-100 rounded-md">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <i className="fas fa-exclamation-triangle text-red-400"></i>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-red-800">
                                  This book is {days} day{days !== 1 ? 's' : ''} overdue. 
                                  Please return it immediately to avoid additional penalties.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {!isOverdue && days <= 3 && days > 0 && (
                          <div className="mt-3 p-3 bg-yellow-100 rounded-md">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <i className="fas fa-clock text-yellow-400"></i>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-yellow-800">
                                  Due in {days} day{days !== 1 ? 's' : ''}. Please plan to return soon.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <i className="fas fa-book text-3xl"></i>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No books issued</h3>
                <p className="mt-1 text-sm text-gray-500">You don't have any books currently issued.</p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="p-4">
            {historyBooks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Details</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Return</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Return</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historyBooks.map((transaction) => {
                      const isOverdue = transaction.status === 'overdue' || 
                        (transaction.status === 'issued' && transaction.expectedReturnDate && new Date(transaction.expectedReturnDate) < new Date());
                      const isReturned = transaction.status === 'returned';
                      const isCurrentlyIssued = transaction.status === 'issued';
                      
                      // Calculate duration
                      const issueDate = new Date(transaction.issueDate);
                      const endDate = transaction.actualReturnDate ? new Date(transaction.actualReturnDate) : new Date();
                      const durationDays = Math.floor((endDate - issueDate) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <tr key={transaction._id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{transaction.book.title}</div>
                                <div className="text-sm text-gray-500">{transaction.book.author}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(transaction.issueDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(transaction.expectedReturnDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(transaction.actualReturnDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isReturned ? 'bg-green-100 text-green-800' : isOverdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {isReturned ? 'Returned' : isOverdue ? 'Overdue' : 'Currently Issued'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {durationDays} {durationDays === 1 ? 'day' : 'days'}
                            {isCurrentlyIssued && ' (ongoing)'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <i className="fas fa-history text-3xl"></i>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No history</h3>
                <p className="mt-1 text-sm text-gray-500">You don't have any book transaction history yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Library Guidelines */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-primary-600 text-white">
          <h3 className="text-lg leading-6 font-medium">Library Guidelines</h3>
          <p className="mt-1 max-w-2xl text-sm">Important rules to follow</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
            <li>Books are issued for a period of 15 days.</li>
            <li>A maximum of 3 books can be issued to a student at a time.</li>
            <li>Books must be returned on or before the due date.</li>
            <li>Late returns will incur a fine of ₹5 per day per book.</li>
            <li>If a book is lost or damaged, the student will be charged the full cost of the book plus a processing fee.</li>
            <li>Reference books, rare books, and periodicals cannot be issued and must be read in the library.</li>
            <li>Maintain silence in the library at all times.</li>
            <li>Library hours: 9:00 AM to 8:00 PM (Monday to Saturday).</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StandaloneMyBooks; 