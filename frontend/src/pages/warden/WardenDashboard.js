import React, { useState, useEffect } from 'react';
import simpleApi from '../../utils/simpleApi';
import { Link, useNavigate } from 'react-router-dom';

const WardenDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    rooms: { total: 0, occupied: 0, available: 0, capacity: 0 },
    students: { total: 0, engineering: 0, medical: 0 },
    feedbacks: { total: 0, pending: 0, resolved: 0 },
    library: { books: 0, borrowed: 0, overdue: 0 },
    placements: { total: 0, placed: 0 }
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Prevent accidental navigation
  useEffect(() => {
    // Save to session storage that we're on this page
    sessionStorage.setItem('currentPage', '/warden/dashboard');
    
    // Define beforeunload handler to prevent accidental page leaves
    const handleBeforeUnload = (e) => {
      const message = "Are you sure you want to leave this page?";
      e.returnValue = message;
      return message;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  // Check if we should return to this page on refresh
  useEffect(() => {
    const savedPage = sessionStorage.getItem('currentPage');
    if (savedPage === '/warden/dashboard' && window.location.pathname !== '/warden/dashboard') {
      navigate('/warden/dashboard');
    }
  }, [navigate]);

  // Fetch dashboard data with real-time updates
  useEffect(() => {
    console.log('WardenDashboard component mounted');
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds for real-time updates
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 1200000);
    
    return () => {
      console.log('WardenDashboard component unmounting');
      clearInterval(refreshInterval);
    };
  }, []);

  // Helper function to fetch library stats
  const fetchLibraryStats = async () => {
    try {
      const booksResponse = await simpleApi.get('/api/books');
      const issuedResponse = await simpleApi.get('/api/books/issued');
      const overdueResponse = await simpleApi.get('/api/books/overdue');
      
      const books = booksResponse.data?.data || [];
      const issued = issuedResponse.data?.data || [];
      const overdue = overdueResponse.data?.data || [];
      
      return {
        books: books.length,
        borrowed: issued.length,
        overdue: overdue.length
      };
    } catch (error) {
      console.error('Error fetching library stats:', error);
      return { books: 0, borrowed: 0, overdue: 0 };
    }
  };

  // Helper function to fetch placement stats
  const fetchPlacementStats = async () => {
    try {
      const response = await simpleApi.get('/api/placements');
      const placements = response.data?.data || [];
      
      return {
        total: placements.length,
        placed: placements.filter(p => p.status === 'placed').length
      };
    } catch (error) {
      console.error('Error fetching placement stats:', error);
      return { total: 0, placed: 0 };
    }
  };

  // Helper function to fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      // Fetch recent data from multiple sources
      const [roomsResponse, feedbackResponse, placementsResponse] = await Promise.all([
        simpleApi.get('/api/rooms?limit=5&sort=-updatedAt'),
        simpleApi.get('/api/feedback?limit=3&sort=-createdAt'),
        simpleApi.get('/api/placements?limit=3&sort=-createdAt')
      ]);

      const activities = [];
      
      // Add recent room activities
      const rooms = roomsResponse.data?.data || [];
      rooms.slice(0, 2).forEach(room => {
        if (room.students && room.students.length > 0) {
          activities.push({
            id: `room-${room._id}`,
            type: 'room',
            icon: 'user',
            color: 'blue',
            message: `Room ${room.roomNumber} updated (${room.currentOccupancy}/${room.capacity} occupied)`,
            time: new Date(room.updatedAt).toLocaleDateString()
          });
        }
      });

      // Add recent feedback activities
      const feedbacks = feedbackResponse.data?.data || [];
      feedbacks.slice(0, 2).forEach(feedback => {
        activities.push({
          id: `feedback-${feedback._id}`,
          type: 'feedback',
          icon: 'message',
          color: 'green',
          message: `New feedback: ${feedback.subject || 'General feedback'}`,
          time: new Date(feedback.createdAt).toLocaleDateString()
        });
      });

      // Add recent placement activities
      const placements = placementsResponse.data?.data || [];
      placements.slice(0, 2).forEach(placement => {
        activities.push({
          id: `placement-${placement._id}`,
          type: 'placement',
          icon: 'briefcase',
          color: 'purple',
          message: `Placement update: ${placement.companyName || 'Company'} - ${placement.status}`,
          time: new Date(placement.createdAt).toLocaleDateString()
        });
      });

      // Sort by most recent and limit to 5
      return activities.slice(0, 5);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [
        {
          id: 'default-1',
          type: 'system',
          icon: 'info',
          color: 'gray',
          message: 'Dashboard loaded successfully',
          time: new Date().toLocaleDateString()
        }
      ];
    }
  };

  // Helper function to fetch room stats
  const fetchRoomStats = async () => {
    try {
      const response = await simpleApi.get(`/api/rooms?_=${new Date().getTime()}`);
      // More robustly find the array of rooms in the response
      const rooms = Array.isArray(response.data?.data) ? response.data.data : 
                    Array.isArray(response.data?.rooms) ? response.data.rooms : 
                    Array.isArray(response.data) ? response.data : [];
      
      console.log('Fetched rooms data:', rooms);
      
      const occupiedCount = rooms.filter(room => room.currentOccupancy > 0).length;
      const totalCapacity = rooms.reduce((sum, room) => sum + (room.capacity || 0), 0);
      const totalOccupancy = rooms.reduce((sum, room) => sum + (room.currentOccupancy || 0), 0);

      return {
        total: rooms.length,
        occupied: occupiedCount,
        available: rooms.length - occupiedCount,
        capacity: totalCapacity,
        occupancy: totalOccupancy,
        occupancyRate: totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0
      };
    } catch (error) {
      console.error('Error fetching room stats:', error);
      return { total: 0, occupied: 0, available: 0, capacity: 0, occupancy: 0, occupancyRate: 0 };
    }
  };

  // Helper function to fetch student stats
  const fetchStudentStats = async () => {
    try {
      const response = await simpleApi.get('/api/users?role=student');
      const students = Array.isArray(response.data?.data) ? response.data.data : 
                      Array.isArray(response.data?.users) ? response.data.users : 
                      Array.isArray(response.data) ? response.data : [];
      
      console.log('Fetched students data:', students);
      
      const engineeringCount = students.filter(student => student.stream === 'Engineering').length;
      const medicalCount = students.filter(student => student.stream === 'Medical').length;
      
      return {
        total: students.length,
        engineering: engineeringCount,
        medical: medicalCount
      };
    } catch (error) {
      console.error('Error fetching student stats:', error);
      return { total: 0, engineering: 0, medical: 0 };
    }
  };

  // Helper function to fetch feedback stats
  const fetchFeedbackStats = async () => {
    try {
      const response = await simpleApi.get(`/api/feedback?_=${new Date().getTime()}`);
      // More robustly find the array of feedbacks in the response
      const feedbacks = Array.isArray(response.data?.data) ? response.data.data : 
                        Array.isArray(response.data?.feedbacks) ? response.data.feedbacks : 
                        Array.isArray(response.data) ? response.data : [];
      
      console.log('Fetched feedback data:', feedbacks);
      
      const resolvedCount = feedbacks.filter(fb => fb.isResolved === true).length;

      return {
        total: feedbacks.length,
        resolved: resolvedCount,
        pending: feedbacks.length - resolvedCount
      };
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      return { total: 0, pending: 0, resolved: 0 };
    }
  };

  const fetchDashboardData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      console.log('Fetching dashboard data...', isManualRefresh ? '(Manual Refresh)' : '(Auto Refresh)');
      
      // Fetch all data in parallel
      const [roomStats, studentStats, feedbackStats, libraryStats, placementStats, activities] = await Promise.all([
        fetchRoomStats(),
        fetchStudentStats(),
        fetchFeedbackStats(),
        fetchLibraryStats(),
        fetchPlacementStats(),
        fetchRecentActivities()
      ]);
      
      console.log('Dashboard data fetched:', {
        roomStats,
        studentStats,
        feedbackStats,
        libraryStats,
        placementStats
      });
      
      // Update stats with fetched data
      setStats({
        rooms: roomStats,
        students: studentStats,
        feedbacks: feedbackStats,
        library: libraryStats,
        placements: placementStats
      });
      
      // Set recent activities
      setRecentActivities(activities);
      
      // Update last updated timestamp
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Warden Dashboard</h1>
            <p className="text-gray-600">Overview of hostel management</p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                  Real-time
                </span>
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Data
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Room Stats */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="font-semibold text-gray-900">Rooms</h2>
                <div className="flex items-center mt-1">
                  <span className="text-3xl font-bold text-gray-900">{stats.rooms.total}</span>
                 
                </div>
              </div>
            </div>
            <Link to="/warden/rooms" className="mt-4 block text-center text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Details
            </Link>
          </div>

          {/* Student Stats */}
          <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="font-semibold text-gray-900">Students</h2>
                <div className="flex items-center mt-1">
                  <span className="text-3xl font-bold text-gray-900">{stats.students.total}</span>
                 
                </div>
              </div>
            </div>
           
          </div>

          {/* Feedback Stats */}
          <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="font-semibold text-gray-900">Feedback</h2>
                <div className="flex items-center mt-1">
                  <span className="text-3xl font-bold text-gray-900">{stats.feedbacks.total}</span>
                  <div className="ml-3 text-xs">
                    <p className="text-yellow-600">{stats.feedbacks.pending} Pending</p>
                    <p className="text-green-600">{stats.feedbacks.resolved} Resolved</p>
                  </div>
                </div>
              </div>
            </div>
            <Link to="/warden/feedback" className="mt-4 block text-center text-yellow-600 hover:text-yellow-800 text-sm font-medium">
              View Details
            </Link>
          </div>

          {/* Library Stats */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="font-semibold text-gray-900">Library</h2>
                <div className="flex items-center mt-1">
                  <span className="text-3xl font-bold text-gray-900">{stats.library.books}</span>
                  <div className="ml-3 text-xs">
                    <p className="text-blue-600">{stats.library.borrowed} Borrowed</p>
                    <p className="text-red-600">{stats.library.overdue} Overdue</p>
                  </div>
                </div>
              </div>
            </div>
            <Link to="/warden/library" className="mt-4 block text-center text-green-600 hover:text-green-800 text-sm font-medium">
              View Details
            </Link>
          </div>

         
        </div>

        {/* Recent Activities */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            <button
              onClick={fetchDashboardData}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Refresh
            </button>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            {recentActivities.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentActivities.map((activity) => {
                  const getIconComponent = (iconType) => {
                    switch (iconType) {
                      case 'user':
                        return (
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        );
                      case 'message':
                        return (
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                        );
                      case 'briefcase':
                        return (
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                          </svg>
                        );
                      default:
                        return (
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        );
                    }
                  };

                  const getColorClasses = (color) => {
                    switch (color) {
                      case 'blue':
                        return 'bg-blue-100 text-blue-600';
                      case 'green':
                        return 'bg-green-100 text-green-600';
                      case 'purple':
                        return 'bg-purple-100 text-purple-600';
                      case 'yellow':
                        return 'bg-yellow-100 text-yellow-600';
                      default:
                        return 'bg-gray-100 text-gray-600';
                    }
                  };

                  return (
                    <li key={activity.id} className="p-4 flex items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 ${getColorClasses(activity.color)}`}>
                        {getIconComponent(activity.icon)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.message}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-2">No recent activities found</p>
                <p className="text-sm">Activities will appear here as they happen</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardenDashboard;