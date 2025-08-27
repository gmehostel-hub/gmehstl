import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import ISTClock from '../../components/ISTClock';

// Admin Dashboard Component
const AdminDashboard = ({ stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {/* Users Card */}
      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Users</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl lg:text-3xl font-bold text-primary-600">{stats.userCount}</p>
            <p className="text-sm text-gray-500">Total Users</p>
          </div>
          <div className="text-primary-500 bg-primary-100 p-3 rounded-full">
            <i className="fas fa-users text-xl"></i>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-100 p-2 rounded">
            <p className="text-sm font-semibold">{stats.adminCount}</p>
            <p className="text-xs text-gray-500">Admins</p>
          </div>
          <div className="bg-gray-100 p-2 rounded">
            <p className="text-sm font-semibold">{stats.wardenCount}</p>
            <p className="text-xs text-gray-500">Wardens</p>
          </div>
          <div className="bg-gray-100 p-2 rounded">
            <p className="text-sm font-semibold">{stats.studentCount}</p>
            <p className="text-xs text-gray-500">Students</p>
          </div>
        </div>
      </div>

      {/* Rooms Card */}
      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Rooms</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl lg:text-3xl font-bold text-primary-600">{stats.roomCount}</p>
            <p className="text-sm text-gray-500">Total Rooms</p>
          </div>
          <div className="text-primary-500 bg-primary-100 p-3 rounded-full">
            <i className="fas fa-building text-xl"></i>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-100 p-2 rounded">
            <p className="text-sm font-semibold">{stats.occupiedRooms}</p>
            <p className="text-xs text-gray-500">Occupied</p>
          </div>
          <div className="bg-gray-100 p-2 rounded">
            <p className="text-sm font-semibold">{stats.availableRooms}</p>
            <p className="text-xs text-gray-500">Available</p>
          </div>
          <div className="bg-gray-100 p-2 rounded">
            <p className="text-sm font-semibold">{stats.specialPurposeRooms}</p>
            <p className="text-xs text-gray-500">Special</p>
          </div>
        </div>
      </div>

      {/* Library Card */}
      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Library</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl lg:text-3xl font-bold text-blue-600">{stats.totalBooks || 0}</p>
            <p className="text-sm text-gray-500">Total Books</p>
          </div>
          <div className="text-blue-500 bg-blue-100 p-3 rounded-full">
            <i className="fas fa-book text-xl"></i>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="bg-gray-100 p-2 rounded">
            <p className="text-sm font-semibold">{stats.availableBooks || 0}</p>
            <p className="text-xs text-gray-500">Available</p>
          </div>
          <div className="bg-gray-100 p-2 rounded">
            <p className="text-sm font-semibold">{stats.issuedBooks || 0}</p>
            <p className="text-xs text-gray-500">Issued</p>
          </div>
        </div>
      </div>

      {/* System Status Card */}
      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">System Status</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl lg:text-3xl font-bold text-green-600">Online</p>
            <p className="text-sm text-gray-500">All Systems</p>
          </div>
          <div className="text-green-500 bg-green-100 p-3 rounded-full">
            <i className="fas fa-check-circle text-xl"></i>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Database</span>
            <span className="text-green-600">Connected</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>API</span>
            <span className="text-green-600">Operational</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);


// Student Dashboard Component
const StudentDashboard = ({ stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {/* My Room */}
      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">My Room</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl lg:text-3xl font-bold text-primary-600">{stats.myRoom}</p>
            <p className="text-sm text-gray-500">Room Assignment</p>
          </div>
          <div className="text-primary-500 bg-primary-100 p-3 rounded-full">
            <i className="fas fa-home text-xl"></i>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="bg-gray-100 p-2 rounded">
            <p className="text-sm font-semibold">{stats.roommates}</p>
            <p className="text-xs text-gray-500">Roommates</p>
          </div>
          <div className="bg-gray-100 p-2 rounded">
            <p className="text-sm font-semibold">{stats.roomCapacity}</p>
            <p className="text-xs text-gray-500">Capacity</p>
          </div>
        </div>
      </div>

      {/* Academic Info */}
      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Academic Status</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl lg:text-3xl font-bold text-green-600">Active</p>
            <p className="text-sm text-gray-500">Enrollment Status</p>
          </div>
          <div className="text-green-500 bg-green-100 p-3 rounded-full">
            <i className="fas fa-graduation-cap text-xl"></i>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current Semester</span>
            <span className="text-gray-600">Active</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Academic Year</span>
            <span className="text-gray-600">2023-24</span>
          </div>
        </div>
      </div>

      {/* My Library */}
      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">My Library</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl lg:text-3xl font-bold text-blue-600">{stats.issuedBooksCount || 0}</p>
            <p className="text-sm text-gray-500">Books Issued</p>
          </div>
          <div className="text-blue-500 bg-blue-100 p-3 rounded-full">
            <i className="fas fa-book text-xl"></i>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {stats.overdueBooks > 0 && (
            <div className="bg-red-50 p-2 rounded flex justify-between text-sm">
              <span className="text-red-600">Overdue Books</span>
              <span className="text-red-600 font-semibold">{stats.overdueBooks}</span>
            </div>
          )}
          <div className="bg-gray-100 p-2 rounded flex justify-between text-sm">
            <span>Library Status</span>
            <span className={`font-semibold ${
              stats.overdueBooks > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {stats.overdueBooks > 0 ? 'Overdue' : 'Good Standing'}
            </span>
          </div>
        </div>
      </div>


    </div>
  </div>
);

// Main Dashboard Component
const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let dashboardData = {};
        
        if (user.role === 'admin') {
          // Fetch real data from backend APIs
          const [usersResponse, roomsResponse, booksResponse] = await Promise.all([
            api.get('/api/users'),
            api.get('/api/rooms'),
            api.get('/api/books')
          ]);
          
          const users = usersResponse.data.data || [];
          const rooms = roomsResponse.data.data || [];
          const books = booksResponse.data.data || [];
          
          // Calculate user statistics
          const adminCount = users.filter(u => u.role === 'admin').length;
          const wardenCount = users.filter(u => u.role === 'warden').length;
          const studentCount = users.filter(u => u.role === 'student').length;
          
          // Calculate room statistics
          const occupiedRooms = rooms.filter(r => r.currentOccupancy > 0).length;
          const availableRooms = rooms.filter(r => r.currentOccupancy < r.capacity && !r.specialPurpose).length;
          const specialPurposeRooms = rooms.filter(r => r.specialPurpose).length;
          
          // Calculate library statistics
          const totalBooks = books.length;
          const availableBooks = books.filter(b => b.available === true).length;
          const issuedBooks = books.filter(b => b.available === false).length;
          
          dashboardData = {
            userCount: users.length,
            adminCount,
            wardenCount,
            studentCount,
            roomCount: rooms.length,
            occupiedRooms,
            availableRooms,
            specialPurposeRooms,
            totalBooks,
            availableBooks,
            issuedBooks
          };
        } else if (user.role === 'warden') {
          // Fetch same data as admin since warden uses AdminDashboard component
          console.log('🔍 WARDEN DASHBOARD: Starting data fetch...');
          try {
            console.log('🔍 WARDEN DASHBOARD: Making API calls...');
            const [usersResponse, roomsResponse, booksResponse, placementsResponse, feedbackResponse] = await Promise.all([
              api.get('/api/users'),
              api.get('/api/rooms'),
              api.get('/api/books'),
              api.get('/api/placements').catch(err => {
                console.log('Placements API failed:', err.message);
                return { data: [] };
              }),
              api.get('/api/feedbacks').catch(err => {
                console.log('Feedbacks API failed:', err.message);
                return { data: [] };
              })
            ]);
            
            console.log('🔍 WARDEN DASHBOARD: Raw API responses:', {
              users: usersResponse.data,
              rooms: roomsResponse.data,
              books: booksResponse.data,
              placements: placementsResponse.data,
              feedbacks: feedbackResponse.data
            });
            
            const users = usersResponse.data.data || usersResponse.data || [];
            const rooms = roomsResponse.data.data || roomsResponse.data || [];
            const books = booksResponse.data.data || booksResponse.data || [];
            const placements = placementsResponse.data.data || placementsResponse.data || [];
            const feedbacks = feedbackResponse.data.data || feedbackResponse.data || [];
            
            console.log('🔍 WARDEN DASHBOARD: Processed data arrays:', {
              usersCount: users.length,
              roomsCount: rooms.length,
              booksCount: books.length,
              placementsCount: placements.length,
              feedbacksCount: feedbacks.length
            });
            
            // Calculate user statistics
            const adminCount = users.filter(u => u.role === 'admin').length;
            const wardenCount = users.filter(u => u.role === 'warden').length;
            const studentCount = users.filter(u => u.role === 'student').length;
            
            // Calculate room statistics
            const occupiedRooms = rooms.filter(r => r.currentOccupancy > 0).length;
            const availableRooms = rooms.filter(r => r.currentOccupancy < r.capacity && !r.specialPurpose).length;
            const specialPurposeRooms = rooms.filter(r => r.specialPurpose).length;
            
            // Calculate library statistics
            const totalBooks = books.length;
            const availableBooks = books.filter(b => b.available === true).length;
            const issuedBooks = books.filter(b => b.available === false).length;
            
            console.log('🔍 WARDEN DASHBOARD: Library calculations:', {
              totalBooks,
              availableBooks,
              issuedBooks
            });
            
            // Calculate placement statistics
            const totalPlacements = placements.length;
            const uniqueCompanies = [...new Set(placements.map(p => p.company))].length;
            
            console.log('🔍 WARDEN DASHBOARD: Placement calculations:', {
              totalPlacements,
              uniqueCompanies
            });
            
            // Calculate feedback statistics
            const totalFeedbacks = feedbacks.length;
            const pendingFeedbacks = feedbacks.filter(f => !f.response).length;
            const respondedFeedbacks = feedbacks.filter(f => f.response).length;
            
            console.log('🔍 WARDEN DASHBOARD: Feedback calculations:', {
              totalFeedbacks,
              pendingFeedbacks,
              respondedFeedbacks
            });
            
            console.log('🔍 WARDEN DASHBOARD: Room calculations:', {
              roomCount: rooms.length,
              occupiedRooms,
              availableRooms,
              specialPurposeRooms
            });
            
            // Construct dashboard data object step by step
            dashboardData = {
              // User statistics
              userCount: users.length,
              adminCount,
              wardenCount,
              studentCount,
              // Room statistics
              roomCount: rooms.length,
              occupiedRooms,
              availableRooms,
              specialPurposeRooms,
              // Library statistics
              totalBooks,
              availableBooks,
              issuedBooks,
              // Placement statistics
              totalPlacements,
              uniqueCompanies,
              // Feedback statistics
              totalFeedbacks,
              pendingFeedbacks,
              respondedFeedbacks
            };
            
            console.log('🔍 WARDEN DASHBOARD: Complete dashboard data object:');
            console.log('📊 User Stats:', { userCount: dashboardData.userCount, adminCount: dashboardData.adminCount, wardenCount: dashboardData.wardenCount, studentCount: dashboardData.studentCount });
            console.log('🏠 Room Stats:', { roomCount: dashboardData.roomCount, occupiedRooms: dashboardData.occupiedRooms, availableRooms: dashboardData.availableRooms, specialPurposeRooms: dashboardData.specialPurposeRooms });
            console.log('📚 Library Stats:', { totalBooks: dashboardData.totalBooks, availableBooks: dashboardData.availableBooks, issuedBooks: dashboardData.issuedBooks });
            console.log('💼 Placement Stats:', { totalPlacements: dashboardData.totalPlacements, uniqueCompanies: dashboardData.uniqueCompanies });
            console.log('💬 Feedback Stats:', { totalFeedbacks: dashboardData.totalFeedbacks, pendingFeedbacks: dashboardData.pendingFeedbacks, respondedFeedbacks: dashboardData.respondedFeedbacks });
          } catch (wardenError) {
            console.error('Error fetching warden dashboard data:', wardenError);
            console.error('Warden error details:', wardenError.response?.data || wardenError.message);
            // Provide fallback data matching admin structure
            dashboardData = {
              userCount: 0,
              adminCount: 0,
              wardenCount: 0,
              studentCount: 0,
              roomCount: 0,
              occupiedRooms: 0,
              availableRooms: 0,
              specialPurposeRooms: 0,
              totalBooks: 0,
              availableBooks: 0,
              issuedBooks: 0,
              totalPlacements: 0,
              uniqueCompanies: 0,
              totalFeedbacks: 0,
              pendingFeedbacks: 0,
              respondedFeedbacks: 0
            };
          }
        } else if (user.role === 'student') {
          // For student, get their room info from their user profile
          const currentUser = await api.get('/api/auth/me');
          const userData = currentUser.data.data;
          
          let myRoom = null;
          if (userData.roomNumber) {
            try {
              const roomResponse = await api.get(`/api/rooms/${userData.roomNumber}`);
              myRoom = roomResponse.data.data;
            } catch (err) {
              console.log('Room not found or error fetching room data');
            }
          }
          
          // Fetch student's library information
          let libraryData = {
            issuedBooksCount: 0,
            overdueBooks: 0,
            currentBooks: []
          };
          
          try {
            const libraryResponse = await api.get(`/api/books/student/${userData.studentId}`);
            if (libraryResponse.data.success) {
              const { currentBooks } = libraryResponse.data.data;
              libraryData.currentBooks = currentBooks || [];
              libraryData.issuedBooksCount = currentBooks ? currentBooks.length : 0;
              
              // Count overdue books
              const currentDate = new Date();
              libraryData.overdueBooks = currentBooks ? currentBooks.filter(book => 
                book.expectedReturnDate && new Date(book.expectedReturnDate) < currentDate
              ).length : 0;
            }
          } catch (err) {
            console.log('Error fetching library data:', err);
          }
          
          dashboardData = {
            myRoom: myRoom ? `Room ${myRoom.roomNumber}` : userData.roomNumber ? `Room ${userData.roomNumber}` : 'Not Assigned',
            roommates: myRoom ? myRoom.currentOccupancy - 1 : 0,
            roomCapacity: myRoom ? myRoom.capacity : 0,
            ...libraryData
          };
        }
        
        console.log('Dashboard data loaded successfully for', user.role, ':', dashboardData);
        setStats(dashboardData);
      } catch (err) {
        console.error('Error fetching dashboard data for', user.role, ':', err);
        console.error('Error details:', err.response?.data || err.message);
        setError(`Failed to load dashboard data. Please try again later. (${err.message})`);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 transition-colors"
          >
            <i className="fas fa-redo mr-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* IST Clock at the top */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <ISTClock showDate={true} showSeconds={true} />
          </div>
        </div>
        
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening in your hostel management system.
          </p>
        </div>
        
        {user.role === 'admin' && <AdminDashboard stats={stats} />}
        {user.role === 'warden' && <AdminDashboard stats={stats} />}
        {user.role === 'student' && <StudentDashboard stats={stats} />}
      </div>
    </div>
  );
};

export default Dashboard;
