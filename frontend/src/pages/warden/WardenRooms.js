import React, { useState, useEffect } from 'react';
import simpleApi from '../../utils/simpleApi';

const WardenRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(() => {
      fetchRooms();
      setLastUpdated(new Date());
    }, 1200000);
    return () => clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await simpleApi.get('/api/rooms?includeStudents=true');
      if (response.data.success) {
        setRooms(response.data.data || []);
      } else {
        setRooms([]);
      }
    } catch (err) {
      setError('Failed to fetch rooms');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (room) => {
    setSelectedRoom(room);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRoom(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchRooms}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Room Cards */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          All Rooms ({rooms.length})
        </h3>

        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No rooms found</div>
            <p className="text-gray-400">
              Rooms will appear here once they are created by the admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => {
              const occupancy = room.students?.length || 0;
              const isOccupied = occupancy > 0;
              
              return (
                <div
                  key={room._id}
                  onClick={() => handleCardClick(room)}
                  className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200 transform hover:-translate-y-1"
                >
                  {/* Room Number */}
                  <div className="text-center mb-4">
                    <h4 className="text-2xl font-bold text-gray-900">
                      {room.roomNumber}
                    </h4>
                    <p className="text-sm text-gray-500">Room Number</p>
                  </div>

                  {/* Room Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Capacity:</span>
                      <span className="text-sm font-semibold text-gray-900">{room.capacity}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Occupancy:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {occupancy}/{room.capacity}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-center mt-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isOccupied 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {isOccupied ? 'Occupied' : 'Available'}
                      </span>
                    </div>

                    {/* Additional Info */}
                    {(room.block || room.floor) && (
                      <div className="pt-3 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-500">
                          {room.block && `Block ${room.block}`}
                          {room.block && room.floor && ' • '}
                          {room.floor && `Floor ${room.floor}`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Click indicator */}
                  <div className="mt-4 text-center">
                    <p className="text-xs text-blue-600">Click for details</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Room Details */}
      {showModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Room {selectedRoom.roomNumber} Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Room Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Room Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Room Number</span>
                    <span className="text-lg font-semibold text-gray-900">{selectedRoom.roomNumber}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Capacity</span>
                    <span className="text-lg font-semibold text-gray-900">{selectedRoom.capacity}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Current Occupancy</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {selectedRoom.students?.length || 0}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Status</span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      (selectedRoom.students?.length || 0) > 0
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {(selectedRoom.students?.length || 0) > 0 ? 'Occupied' : 'Available'}
                    </span>
                  </div>
                  {selectedRoom.block && (
                    <div>
                      <span className="block text-sm font-medium text-gray-600">Block</span>
                      <span className="text-lg font-semibold text-gray-900">{selectedRoom.block}</span>
                    </div>
                  )}
                  {selectedRoom.floor && (
                    <div>
                      <span className="block text-sm font-medium text-gray-600">Floor</span>
                      <span className="text-lg font-semibold text-gray-900">{selectedRoom.floor}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Student Details */}
              {selectedRoom.students && selectedRoom.students.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Student Details ({selectedRoom.students.length})
                  </h3>
                  <div className="space-y-4">
                    {selectedRoom.students.map((student, index) => (
                      <div key={student._id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {student.name?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                          
                          {/* Student Info */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">{student.name}</h4>
                                <p className="text-sm text-gray-600">{student.email}</p>
                              </div>
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                Student #{index + 1}
                              </span>
                            </div>
                            
                            {/* Detailed Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <span className="block text-sm font-medium text-gray-600">Student ID</span>
                                <span className="text-sm text-gray-900">{student.studentId || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-sm font-medium text-gray-600">Phone Number</span>
                                <span className="text-sm text-gray-900">{student.phoneNumber || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-sm font-medium text-gray-600">Year</span>
                                <span className="text-sm text-gray-900">{student.year || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-sm font-medium text-gray-600">Branch</span>
                                <span className="text-sm text-gray-900">{student.branch || 'N/A'}</span>
                              </div>
                              <div className="md:col-span-2">
                                <span className="block text-sm font-medium text-gray-600">College</span>
                                <span className="text-sm text-gray-900">{student.college || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg mb-2">No students assigned</div>
                  <p className="text-gray-400">This room is currently empty.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
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

export default WardenRooms;
