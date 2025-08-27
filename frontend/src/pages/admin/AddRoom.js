import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const AddRoom = () => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    capacity: 6,
    specialPurpose: false,
    purpose: 'Regular'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [existingRooms, setExistingRooms] = useState([]);

  // Room purposes
  const roomPurposes = [
    'Regular',
    'Cooking Staff Room',
    'Digital Lab 1',
    'Digital Lab 2',
    'Study Room',
    'Common Room',
    'Storage Room',
    'Maintenance Room'
  ];

  useEffect(() => {
    fetchExistingRooms();
  }, []);

  const fetchExistingRooms = async () => {
    try {
      const response = await api.get('/api/rooms');
      setExistingRooms(response.data.data || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.roomNumber) {
      setError('Room number is required');
      setLoading(false);
      return;
    }

    // Check if room number already exists
    const roomExists = existingRooms.some(room => 
      room.roomNumber.toString() === formData.roomNumber.toString()
    );
    
    if (roomExists) {
      setError(`Room ${formData.roomNumber} already exists`);
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/rooms', {
        ...formData,
        roomNumber: parseInt(formData.roomNumber),
        capacity: parseInt(formData.capacity)
      });
      
      setSuccess(`Room ${formData.roomNumber} created successfully!`);
      
      // Reset form
      setFormData({
        roomNumber: '',
        capacity: 6,
        specialPurpose: false,
        purpose: 'Regular'
      });
      
      // Refresh existing rooms
      fetchExistingRooms();
      
    } catch (err) {
      console.error('Error creating room:', err);
      setError(err.response?.data?.message || 'Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getNextAvailableRoomNumber = () => {
    if (existingRooms.length === 0) return 1;
    
    const roomNumbers = existingRooms.map(room => parseInt(room.roomNumber)).sort((a, b) => a - b);
    
    for (let i = 1; i <= roomNumbers.length + 1; i++) {
      if (!roomNumbers.includes(i)) {
        return i;
      }
    }
    
    return roomNumbers[roomNumbers.length - 1] + 1;
  };

  const suggestRoomNumber = () => {
    const nextNumber = getNextAvailableRoomNumber();
    setFormData({
      ...formData,
      roomNumber: nextNumber.toString()
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Room</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Room Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Number *
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter room number"
                  required
                  min="1"
                />
                <button
                  type="button"
                  onClick={suggestRoomNumber}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Suggest
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Next available: {getNextAvailableRoomNumber()}
              </p>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Capacity
              </label>
              <select
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 Student</option>
                <option value={2}>2 Students</option>
                <option value={3}>3 Students</option>
                <option value={4}>4 Students</option>
                <option value={5}>5 Students</option>
                <option value={6}>6 Students</option>
                <option value={8}>8 Students</option>
                <option value={10}>10 Students</option>
              </select>
            </div>

            {/* Special Purpose */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="specialPurpose"
                  checked={formData.specialPurpose}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Special Purpose Room
                </span>
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Check if this room has a special purpose (lab, study room, etc.)
              </p>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Purpose
              </label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roomPurposes.map(purpose => (
                  <option key={purpose} value={purpose}>
                    {purpose}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    roomNumber: '',
                    capacity: 6,
                    specialPurpose: false,
                    purpose: 'Regular'
                  });
                  setError(null);
                  setSuccess(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </div>
          </form>

          {/* Existing Rooms Summary */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Existing Rooms ({existingRooms.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {existingRooms.map(room => (
                <div
                  key={room._id}
                  className="p-2 bg-gray-100 rounded text-center text-sm"
                >
                  <div className="font-medium">Room {room.roomNumber}</div>
                  <div className="text-gray-600">
                    {room.currentOccupancy || 0}/{room.capacity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRoom;
