import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import simpleApi from '../../utils/simpleApi';
import { HomeIcon, UsersIcon, BookOpenIcon, BriefcaseIcon, BellIcon, ChevronRightIcon, RefreshIcon, ExclamationCircleIcon } from '../../components/icons'; // Assuming you have an icons component

// Reusable component for statistic cards
const StatCard = ({ icon, title, value, details, color, loading }) => (
  <div className={`bg-white border-l-4 ${color.border} shadow-md rounded-lg p-4 flex items-center`}>
    <div className={`p-3 rounded-full ${color.bg} mr-4`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
      {loading ? (
        <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-md mt-1"></div>
      ) : (
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
      )}
      {details && !loading && <p className="text-sm text-gray-500 mt-1">{details}</p>}
    </div>
  </div>
);

// Reusable component for quick action links
const QuickAction = ({ to, icon, title, subtitle }) => (
  <Link to={to} className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-transform transform hover:scale-105">
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-gray-100 mr-4">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
    <ChevronRightIcon className="h-6 w-6 text-gray-400" />
  </Link>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [roomsRes, usersRes, booksRes, placementsRes, feedbackRes] = await Promise.all([
        simpleApi.get('/api/rooms').catch(e => e),
        simpleApi.get('/api/users?role=student').catch(e => e),
        simpleApi.get('/api/books').catch(e => e),
        simpleApi.get('/api/placements').catch(e => e),
        simpleApi.get('/api/feedback').catch(e => e),
      ]);

      // Helper to check for errors and extract data
      const getData = (res) => {
        if (res instanceof Error || res.status !== 200) return [];
        return res.data.data || [];
      };

      const rooms = getData(roomsRes);
      const students = getData(usersRes);
      const books = getData(booksRes);
      const placements = getData(placementsRes);
      const feedback = getData(feedbackRes);

      const totalRooms = rooms.length;
      const occupiedRooms = rooms.filter(room => room.currentOccupancy > 0).length;

      const totalBooks = books.reduce((sum, book) => sum + (book.totalCopies || 0), 0);
      const issuedBooks = books.reduce((sum, book) => sum + (book.issuedCopies || 0), 0);

      setDashboardData({
        totalRooms,
        occupiedRooms,
        availableRooms: totalRooms - occupiedRooms,
        totalStudents: students.length,
        totalBooks,
        issuedBooks,
        availableBooks: totalBooks - issuedBooks,
        totalPlacements: placements.length,
        totalFeedback: feedback.length,
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const stats = [
    {
      icon: <HomeIcon className="h-6 w-6 text-blue-600" />,
      title: 'Hostel Rooms',
      value: dashboardData.totalRooms,
      details: `${dashboardData.availableRooms} Available / ${dashboardData.occupiedRooms} Occupied`,
      color: { border: 'border-blue-500', bg: 'bg-blue-100' },
    },
    {
      icon: <UsersIcon className="h-6 w-6 text-green-600" />,
      title: 'Students',
      value: dashboardData.totalStudents,
      details: 'Total registered students',
      color: { border: 'border-green-500', bg: 'bg-green-100' },
    },
    {
      icon: <BookOpenIcon className="h-6 w-6 text-purple-600" />,
      title: 'Library',
      value: dashboardData.totalBooks,
      details: `${dashboardData.availableBooks} Available / ${dashboardData.issuedBooks} Issued`,
      color: { border: 'border-purple-500', bg: 'bg-purple-100' },
    },
    {
      icon: <BriefcaseIcon className="h-6 w-6 text-yellow-600" />,
      title: 'Placements',
      value: dashboardData.totalPlacements,
      details: 'Total successful placements',
      color: { border: 'border-yellow-500', bg: 'bg-yellow-100' },
    },
  ];

  const actions = [
    { to: '/admin/rooms', icon: <HomeIcon className="h-6 w-6 text-blue-600" />, title: 'Manage Rooms', subtitle: 'Allocate and manage hostel rooms' },
    { to: '/admin/books', icon: <BookOpenIcon className="h-6 w-6 text-purple-600" />, title: 'Manage Library', subtitle: 'Add, edit, and track books' },
    { to: '/admin/placements', icon: <BriefcaseIcon className="h-6 w-6 text-yellow-600" />, title: 'Manage Placements', subtitle: 'Update placement records' },
    { to: '/admin/feedback', icon: <BellIcon className="h-6 w-6 text-red-600" />, title: 'Review Feedback', subtitle: 'View and respond to feedback' },
  ];

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-md text-gray-600">Welcome back, {user?.name || 'Admin'}. Here's your overview.</p>
        </div>
        <button
          onClick={() => fetchDashboardData()}
          disabled={loading}
          className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 flex items-center">
          <ExclamationCircleIcon className="h-6 w-6 mr-3" />
          <div>
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} loading={loading} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
