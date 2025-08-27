import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import simpleApi from '../../utils/simpleApi';

const MyRoom = () => {
  const [user, setUser] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoommate, setSelectedRoommate] = useState(null); // NEW STATE

  useEffect(() => {
    // Session persistence
    sessionStorage.setItem('lastVisitedPath', '/my-room');
    loadRoomData();
  }, []);

  const loadRoomData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('Please log in to access your room information.');
        setLoading(false);
        return;
      }

      const currentUser = JSON.parse(userData);
      setUser(currentUser);

      // Set basic room data from user
      const basicRoomData = {
        roomNumber: currentUser.roomNumber || 'N/A',
        building: currentUser.building || 'N/A',
        floor: currentUser.floor || 'N/A',
        capacity: 2, // Default capacity
        occupied: 1, // At least the current user
      };

      setRoomData(basicRoomData);

      // Fetch room info using the student endpoint
      try {
        const roomResponse = await simpleApi.get('/api/rooms/my-room');
        if (roomResponse.data.success) {
          const room = roomResponse.data.data;
          setRoomData({
            roomNumber: room.roomNumber || currentUser.roomNumber,
            building: room.building || currentUser.building,
            floor: room.floor || currentUser.floor,
            capacity: room.capacity || 2,
            occupied: room.currentOccupancy || 1,
            type: room.type || 'Standard',
            facilities: room.facilities || ['Bed', 'Study Table', 'Wardrobe'],
          });
        }
      } catch (err) {
        console.warn('Could not load detailed room data:', err);
      }

      // Try to load roommates (non-blocking)
      try {
        // Use the correct endpoint for current student's roommates
        const roommatesResponse = await simpleApi.get('/api/rooms/my-roommates');
        if (roommatesResponse.data.success) {
          const roommatesList = roommatesResponse.data.data || [];
          setRoommates(roommatesList);
        }
      } catch (err) {
        console.warn('Could not load roommates data:', err);
      }

      setLoading(false);
    } catch (err) {
      console.error('Room loading error:', err);
      setError('Failed to load room information. Please try refreshing the page.');
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setError(null);
    loadRoomData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your room information...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Room Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Room Details & Hostel Rules */}
          <div className="lg:col-span-2 space-y-8">
            {/* Room Details Card */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Room Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Room Number */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Room Number</p>
                      <p className="text-2xl font-bold text-blue-600">{roomData?.roomNumber}</p>
                    </div>
                  </div>
                </div>

                
              </div>
            </div>

            {/* Roommates Card */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Roommates</h2>

              {roommates.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600">No roommates found</p>
                  <p className="text-sm text-gray-500 mt-1">You might be the only occupant</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {roommates.map((roommate, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition"
                      onClick={() => setSelectedRoommate(roommate)}
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-blue-600 font-semibold text-lg">
                            {roommate.name ? roommate.name.charAt(0).toUpperCase() : 'R'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{roommate.name || 'Roommate'}</h3>
                          <p className="text-sm text-gray-600">{roommate.email || 'No email available'}</p>
                          {roommate.phoneNumber && (
                            <p className="text-xs text-gray-500">{roommate.phoneNumber}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Roommate Count */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Roommates</p>
                  <p className="text-2xl font-bold text-blue-600">{roommates.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hostel Rules Card */}
          <div className="lg:col-span-1">
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-700 mb-3">Hostel Rules</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Maintain silence in the hostel premises.</li>
                <li>Visitors are not allowed inside the hostel.</li>
                <li>Keep your room and common areas clean.</li>
                <li>Report any maintenance issues to the warden promptly.</li>
                <li>Alcohol, drugs, and smoking are strictly prohibited.</li>
                <li>Respect hostel staff and fellow residents.</li>
                <li>Adhere to the hostel timings and curfew.</li>
                <li>Vehicles should be parked inside the parking area.</li>
                <li>Respect the privacy of your roommates.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Roommate Details Modal */}
        {selectedRoommate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setSelectedRoommate(null)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Roommate Details</h2>
              <div className="space-y-3">
                <div className="bg-blue-50 rounded p-3 flex justify-between">
                  <span className="font-semibold">Name:</span>
                  <span>{selectedRoommate.name || 'N/A'}</span>
                </div>
                <div className="bg-blue-50 rounded p-3 flex justify-between">
                  <span className="font-semibold">Year:</span>
                  <span>{selectedRoommate.year || 'N/A'}</span>
                </div>
                <div className="bg-blue-50 rounded p-3 flex justify-between">
                  <span className="font-semibold">Phone Number:</span>
                  <span>{selectedRoommate.phoneNumber || 'N/A'}</span>
                </div>
                <div className="bg-blue-50 rounded p-3 flex justify-between">
                  <span className="font-semibold">Email:</span>
                  <span>{selectedRoommate.email || 'N/A'}</span>
                </div>
                <div className="bg-blue-50 rounded p-3 flex justify-between">
                  <span className="font-semibold">College:</span>
                  <span>{selectedRoommate.college || 'N/A'}</span>
                </div>
                <div className="bg-blue-50 rounded p-3 flex justify-between">
                  <span className="font-semibold">Branch:</span>
                  <span>{selectedRoommate.branch || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRoom;