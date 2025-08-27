import React, { useState, useEffect } from 'react';
import simpleApi from '../../utils/simpleApi';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [studentResponse, booksResponse] = await Promise.all([
          simpleApi.get('/api/users/me'),
          simpleApi.get('/api/books/my-books')
        ]);

        if (studentResponse.data.success) {
          setStudent(studentResponse.data.data);
        } else {
          throw new Error(studentResponse.data.message || 'Failed to fetch student profile');
        }

        if (booksResponse.data.success) {
          setIssuedBooks(booksResponse.data.data);
        } else {
          throw new Error(booksResponse.data.message || 'Failed to fetch issued books');
        }

      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred while fetching data.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Dashboard</h1>

      {student && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700 border-b pb-2">My Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><p><strong>Name:</strong> {student.name}</p></div>
            <div><p><strong>Student ID:</strong> {student.studentId}</p></div>
            <div><p><strong>Email:</strong> {student.email}</p></div>
            <div><p><strong>Phone:</strong> {student.phoneNumber}</p></div>
            <div><p><strong>Room:</strong> {student.roomNumber || 'Not Assigned'}</p></div>
            <div><p><strong>College:</strong> {student.college}</p></div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 border-b pb-2">My Issued Books</h2>
        {issuedBooks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 text-left">Book Title</th>
                  <th className="py-2 px-4 text-left">Issue Date</th>
                  <th className="py-2 px-4 text-left">Expected Return</th>
                  <th className="py-2 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {issuedBooks.map((transaction) => (
                  <tr key={transaction._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{transaction.book.title}</td>
                    <td className="py-2 px-4">{new Date(transaction.issueDate).toLocaleDateString()}</td>
                    <td className="py-2 px-4">{new Date(transaction.expectedReturnDate).toLocaleDateString()}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                        transaction.status === 'returned' ? 'bg-green-200 text-green-800' :
                        transaction.status === 'overdue' ? 'bg-red-200 text-red-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">You have no books issued to you.</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
