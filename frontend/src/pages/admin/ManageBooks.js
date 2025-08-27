import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import simpleApi from '../../utils/simpleApi';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('books');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Form states
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    bookId: '',
    price: 0,
    totalCopies: 1
  });

  const [issueForm, setIssueForm] = useState({
    bookId: '',
    studentEmail: '',
    issueDate: ''
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await simpleApi.get('/api/books');
      if (response.data.success) {
        setBooks(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverdueBooks = async () => {
    try {
      const response = await simpleApi.get('/api/books/overdue');
      if (response.data.success) {
        setOverdueBooks(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching overdue books:', error);
      toast.error('Failed to load overdue books');
    }
  };

  const fetchIssuedBooks = async () => {
    try {
      const response = await simpleApi.get('/api/books/issued');
      if (response.data.success) {
        setIssuedBooks(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching issued books:', error);
      toast.error('Failed to load issued books');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await simpleApi.get('/api/users?role=student');
      if (response.data.success) {
        setStudents(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchIssuedBooks();
    fetchOverdueBooks();
    fetchStudents();
    
    const refreshInterval = setInterval(() => {
      fetchBooks();
      fetchIssuedBooks();
      fetchOverdueBooks();
    }, 1200000);
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  const handleRefresh = () => {
    fetchBooks();
    fetchIssuedBooks();
    fetchOverdueBooks();
    fetchStudents();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

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

  const availabilityStatuses = [
    { value: 'all', label: 'All Books' },
    { value: 'available', label: 'Available' },
    { value: 'unavailable', label: 'Unavailable' }
  ];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (book.bookId && book.bookId.includes(searchTerm));
    const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'available' && book.availableCopies > 0) ||
                         (statusFilter === 'unavailable' && book.availableCopies === 0);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await simpleApi.post('/api/books', bookForm);
      if (response.data.success) {
        await fetchBooks();
        setBookForm({ title: '', author: '', bookId: '', price: 0, category: '', totalCopies: 1 });
        setShowAddForm(false);
        toast.success('Book added successfully!');
      } else {
        toast.error(response.data.message || 'Failed to add book');
      }
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error('Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await simpleApi.put(`/api/books/${editingBook._id}`, bookForm);
      if (response.data.success) {
        await fetchBooks();
        setEditingBook(null);
        setBookForm({ title: '', author: '', bookId: '', price: 0, category: '', totalCopies: 1 });
        setShowAddForm(false);
        toast.success('Book updated successfully!');
      } else {
        toast.error(response.data.message || 'Failed to update book');
      }
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Failed to update book');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      setLoading(true);
      try {
        const response = await simpleApi.delete(`/api/books/${bookId}`);
        if (response.data.success) {
          await fetchBooks();
          toast.success('Book deleted successfully!');
        } else {
          toast.error(response.data.message || 'Failed to delete book');
        }
      } catch (error) {
        console.error('Error deleting book:', error);
        toast.error('Failed to delete book');
      } finally {
        setLoading(false);
      }
    }
  };

  const startEditBook = (book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      bookId: book.bookId,
      price: book.price || 0,
      category: book.category,
      totalCopies: book.totalCopies
    });
    setShowAddForm(true);
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();

    if (!issueForm.bookId || !issueForm.studentEmail || !issueForm.issueDate) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const book = books.find(b => b.bookId === issueForm.bookId);
      if (!book) {
        toast.error('Book not found with the provided Book ID');
        setLoading(false);
        return;
      }

      const studentResponse = await simpleApi.get(`/api/users?role=student&email=${issueForm.studentEmail}`);
      if (!studentResponse.data.success || studentResponse.data.data.length === 0) {
        toast.error('Student with this ID not found.');
        setLoading(false);
        return;
      }
      const student = studentResponse.data.data[0];

      const response = await simpleApi.post(`/api/books/${book._id}/issue/${student._id}`, {
        issueDate: issueForm.issueDate
      });

      if (response.data.success) {
        toast.success(`Book "${book.title}" issued to ${student.name} successfully!`);
        await fetchBooks();
        await fetchIssuedBooks();
        await fetchOverdueBooks();
        setIssueForm({ bookId: '', studentEmail: '', issueDate: '' });
        setShowIssueForm(false);
      } else {
        toast.error(response.data.message || 'Failed to issue book');
      }
    } catch (error) {
      console.error('Error issuing book:', error);
      const errorMessage = error.response?.data?.message || 'Failed to issue book';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverBook = async (transactionId) => {
    if (window.confirm('Are you sure you want to mark this book as recovered? This is for books that were lost and found.')) {
      setLoading(true);
      try {
        const response = await simpleApi.put(`/api/books/recover/${transactionId}`);
        if (response.data.success) {
          toast.success('Book marked as recovered successfully!');
          fetchIssuedBooks();
          fetchOverdueBooks();
          fetchBooks();
        } else {
          toast.error(response.data.message || 'Failed to recover book');
        }
      } catch (error) {
        toast.error(error.message || 'An error occurred while recovering the book');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSendReminder = async (transactionId) => {
    setLoading(true);
    try {
      const response = await simpleApi.post(`/api/books/remind/${transactionId}`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchOverdueBooks(); // Refresh the list to show updated reminder status
      } else {
        toast.error(response.data.message || 'Failed to send reminder');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred while sending the reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsLost = async (transactionId) => {
    try {
      setLoading(true);
      await simpleApi.put(`/api/books/mark-lost/${transactionId}`);
      toast.success('Book marked as lost.');
      fetchIssuedBooks();
      fetchOverdueBooks();
    } catch (error) {
      console.error('Error marking book as lost:', error);
      toast.error(error.response?.data?.message || 'Failed to mark book as lost.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (transactionId) => {
    if (window.confirm('Are you sure you want to mark this book as returned?')) {
      setLoading(true);
      try {
        const response = await simpleApi.put(`/api/books/return/${transactionId}`);
        if (response.data.success) {
          toast.success('Book marked as returned successfully!');
          fetchIssuedBooks();
          fetchOverdueBooks();
          fetchBooks();
        } else {
          toast.error(response.data.message || 'Failed to return book');
        }
      } catch (error) {
        toast.error(error.message || 'An error occurred while returning the book');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Library Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => { setEditingBook(null); setBookForm({ title: '', author: '', bookId: '', price: 0, category: '', totalCopies: 1 }); setShowAddForm(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            Add Book
          </button>
          <button
            onClick={() => setShowIssueForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors"
          >
            Issue Book
          </button>
          <button onClick={handleRefresh} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
            Refresh
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'books', label: 'All Books', count: filteredBooks.length },
            { id: 'issued', label: 'Issued Books', count: issuedBooks.length },
            { id: 'overdue', label: 'Overdue Books', count: overdueBooks.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} <span className="bg-gray-200 text-gray-700 text-xs font-semibold ml-2 px-2 py-0.5 rounded-full">{tab.count}</span>
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'books' && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by title, author, or Book ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availabilityStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Book Details</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Availability</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBooks.map((book) => (
                  <tr key={book._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{book.title} ({book.bookId})</div>
                      <div className="text-sm text-gray-500">by {book.author}</div>
                      <div className="text-sm text-gray-500">Price: ₹{book.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        book.availableCopies > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {book.availableCopies > 0 ? `${book.availableCopies} Available` : 'Unavailable'}
                      </span>
                      <div className="text-sm text-gray-500">Total: {book.totalCopies}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => startEditBook(book)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                      <button onClick={() => handleDeleteBook(book._id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'issued' && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Book Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issuedBooks.filter(t => t.book && t.student).map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.book.title}</div>
                      <div className="text-sm text-gray-500">{transaction.book.bookId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.student.name}</div>
                      <div className="text-sm text-gray-500">{transaction.student.studentId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Issued: {formatDate(transaction.issueDate)}</div>
                      <div className="text-sm text-gray-500">Due: {formatDate(transaction.dueDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleReturnBook(transaction._id)} className="text-green-600 hover:text-green-900">Return</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'overdue' && (
         <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Book Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {overdueBooks.filter(t => t.book && t.student).map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.book.title}</div>
                      <div className="text-sm text-gray-500">{transaction.book.bookId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.student.name}</div>
                      <div className="text-sm text-gray-500">{transaction.student.studentId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Issued: {formatDate(transaction.issueDate)}</div>
                      <div className="text-sm text-red-600">Due: {formatDate(transaction.dueDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                         Overdue
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">₹{transaction.fine}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {transaction.status === 'lost' ? (
                        <button onClick={() => handleRecoverBook(transaction._id)} className="text-yellow-600 hover:text-yellow-900">Recover</button>
                      ) : (
                        <>
                          <button onClick={() => handleReturnBook(transaction._id)} className="text-green-600 hover:text-green-900 mr-2">Return</button>
                          <button onClick={() => handleSendReminder(transaction._id)} className="text-blue-600 hover:text-blue-900">Send Reminder</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Book Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
            <form onSubmit={editingBook ? handleEditBook : handleAddBook}>
              <div className="grid grid-cols-1 gap-4">
                <input type="text" placeholder="Title" value={bookForm.title} onChange={(e) => setBookForm({...bookForm, title: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                <input type="text" placeholder="Author" value={bookForm.author} onChange={(e) => setBookForm({...bookForm, author: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                <input type="text" placeholder="Book ID" value={bookForm.bookId} onChange={(e) => setBookForm({...bookForm, bookId: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                <input type="number" placeholder="Price" value={bookForm.price} onChange={(e) => setBookForm({...bookForm, price: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                <input type="number" placeholder="Total Copies" value={bookForm.totalCopies} onChange={(e) => setBookForm({...bookForm, totalCopies: e.target.value})} className="w-full px-3 py-2 border rounded" required min="1" />
              </div>
              <div className="flex justify-end mt-6">
                <button type="button" onClick={() => setShowAddForm(false)} className="mr-4 px-4 py-2 rounded">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingBook ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Book Modal */}
      {showIssueForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Issue Book</h2>
            <form onSubmit={handleIssueBook}>
              <div className="grid grid-cols-1 gap-4">
                <input type="text" placeholder="Book ID" value={issueForm.bookId} onChange={(e) => setIssueForm({...issueForm, bookId: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                <input type="email" placeholder="Student Email" value={issueForm.studentEmail} onChange={(e) => setIssueForm({...issueForm, studentEmail: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                <input type="date" value={issueForm.issueDate} onChange={(e) => setIssueForm({...issueForm, issueDate: e.target.value})} className="w-full px-3 py-2 border rounded" required />
              </div>
              <div className="flex justify-end mt-6">
                <button type="button" onClick={() => setShowIssueForm(false)} className="mr-4 px-4 py-2 rounded">Cancel</button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default ManageBooks;
