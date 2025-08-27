import React, { useState, useEffect } from 'react';
import simpleApi from '../../utils/simpleApi';
import { useNavigate } from 'react-router-dom';

const StandaloneRooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [students, setStudents] = useState([]);
  const [isCleaning, setIsCleaning] = useState(false);
  const [showAddRoomForm, setShowAddRoomForm] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: '',
    capacity: 6,
    purpose: 'Regular',
    specialPurpose: false,
  });
  const [studentFormData, setStudentFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    branch: '',
    year: '',
    stream: '',
    college: '',
    roomNumber: ''
  });

  // Function to handle student creation and room assignment
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Prepare student data according to backend expectations
      const studentData = {
        name: studentFormData.name,
        email: studentFormData.email,
        phoneNumber: studentFormData.phone, // Note: backend expects phoneNumber, not phone
        studentId: studentFormData.studentId,
        branch: studentFormData.branch,
        year: studentFormData.year,
        stream: studentFormData.stream,
        college: studentFormData.college,
        role: 'student',
        autoGeneratePassword: true, // Let backend generate a secure password
        roomNumber: studentFormData.roomNumber || undefined // Only include if room number is selected
      };

      console.log('Creating student with data:', studentData);

      // 1. Create the student
      const response = await simpleApi.post('/api/users', studentData);
      
      if (response.data.success) {
        // Show success message
        setActionSuccess(response.data.message || 'Student added successfully!');
        
        // Reset the form
        setStudentFormData({
          name: '',
          email: '',
          phone: '',
          studentId: '',
          branch: '',
          year: '',
          stream: '',
          college: '',
          roomNumber: ''
        });
        
        // Close the modal and refresh the rooms list
        setShowAddStudentModal(false);
        fetchRooms();
      } else {
        // Handle case where API returns success: false
        setActionError(response.data.message || 'Failed to add student. Please try again.');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      // Provide more specific error messages based on the error response
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Failed to add student. Please check the form and try again.';
      setActionError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Fetch rooms data
  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await simpleApi.get('/api/rooms');
      setRooms(response.data.data || []);
    } catch (err) {
      setError('Failed to load rooms. Please try again.');
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  // Handle viewing a room
  const handleViewRoom = async (roomId) => {
    try {
      setLoading(true);
      const roomResponse = await simpleApi.get(`/api/rooms/${roomId}`);
      setSelectedRoom(roomResponse.data.data);

      if (roomResponse.data.data.students && roomResponse.data.data.students.length > 0) {
        const studentIds = roomResponse.data.data.students.join(',');
        const studentsResponse = await simpleApi.get(`/api/users?role=student&_id=${studentIds}`);
        setStudents(studentsResponse.data.data || []);
      } else {
        setStudents([]);
      }
    } catch (err) {
      setActionError('Failed to load room details.');
      console.error('Error fetching room details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setSelectedRoom(null);
        setShowAddRoomForm(false);
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Handle creating a room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const response = await simpleApi.post('/api/rooms', formData);
      if (response.data.success) {
        setActionSuccess('Room created successfully!');
        setShowAddRoomForm(false);
        fetchRooms();
        setFormData({ roomNumber: '', capacity: 6, purpose: 'Regular', specialPurpose: false });
      } else {
        setActionError(response.data.message || 'Failed to create room.');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'An error occurred.');
    }
  };

  // Handle deleting a room
  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await simpleApi.delete(`/api/rooms/${roomId}`);
        setActionSuccess('Room deleted successfully!');
        fetchRooms();
      } catch (err) {
        setActionError(err.response?.data?.message || 'Failed to delete room.');
      }
    }
  };

  // Handle removing a student from a room
  const handleRemoveStudent = async (studentId, roomId) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      try {
        await simpleApi.post('/api/rooms/remove-student', { studentId, roomId });
        setActionSuccess('Student removed successfully!');
        handleViewRoom(roomId); // Refresh room details
        fetchRooms(); // Refresh room list
      } catch (err) {
        setActionError(err.response?.data?.message || 'Failed to remove student.');
      }
    }
  };

  // Handle cleaning the database
  const handleCleanDatabase = async () => {
    if (window.confirm('This will remove orphaned students from rooms. Proceed?')) {
      setIsCleaning(true);
      try {
        const res = await simpleApi.put('/api/rooms/clean-orphans');
        setActionSuccess(res.data.message);
        fetchRooms();
      } catch (error) {
        setActionError(error.response?.data?.message || 'Database cleaning failed.');
      } finally {
        setIsCleaning(false);
      }
    }
  };

  // Auto-clear feedback messages
  useEffect(() => {
    if (actionSuccess || actionError) {
      const timer = setTimeout(() => {
        setActionSuccess(null);
        setActionError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess, actionError]);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Manage Hostel Rooms</h1>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button onClick={fetchRooms} className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            Refresh
          </button>
          <button 
            onClick={() => setShowAddStudentModal(true)} 
            className="flex-1 sm:flex-none px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
          >
            Add Student
          </button>
          <button onClick={() => setShowAddRoomForm(true)} className="flex-1 sm:flex-none px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
            Add Room
          </button>
          <button onClick={handleCleanDatabase} disabled={isCleaning} className="flex-1 sm:flex-none px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300 transition-colors">
            {isCleaning ? 'Cleaning...' : 'Clean DB'}
          </button>
        </div>
      </div>

      {/* Action Feedback */}
      {actionSuccess && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-md relative mb-4 shadow-sm" role="alert">{actionSuccess}</div>}
      {actionError && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md relative mb-4 shadow-sm" role="alert">{actionError}</div>}

      {/* Loading and Error States */}
      {loading && !selectedRoom ? (
        <div className="text-center py-10"><p className="text-gray-600">Loading rooms, please wait...</p></div>
      ) : error ? (
        <div className="text-center py-10 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-semibold">{error}</p>
          <button onClick={fetchRooms} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
            Try Again
          </button>
        </div>
      ) : (
        /* Rooms Table */
        <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Room No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Occupancy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Purpose</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.roomNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{`${room.currentOccupancy || 0} / ${room.capacity}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{room.purpose}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button onClick={() => handleViewRoom(room._id)} className="text-indigo-600 hover:text-indigo-800 font-semibold mr-4 transition-colors">View</button>
                      <button onClick={() => handleDeleteRoom(room._id)} className="text-red-600 hover:text-red-800 font-semibold transition-colors">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-500">
                    <p className="font-semibold">No rooms found.</p>
                    <p className="text-sm">Click 'Add Room' to create one.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoomForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <form onSubmit={handleCreateRoom}>
              <div className="p-6 border-b bg-gray-50 rounded-t-lg">
                <h2 className="text-xl font-semibold text-gray-800">Add New Room</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">Room Number</label>
                  <input type="text" id="roomNumber" name="roomNumber" value={formData.roomNumber} onChange={handleChange} required className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity</label>
                  <input type="number" id="capacity" name="capacity" value={formData.capacity} onChange={handleChange} required className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">Purpose</label>
                  <select id="purpose" name="purpose" value={formData.purpose} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    <option>Regular</option>
                    <option>Guest</option>
                    <option>Staff</option>
                  </select>
                </div>
                <div className="flex items-center pt-2">
                  <input type="checkbox" id="specialPurpose" name="specialPurpose" checked={formData.specialPurpose} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                  <label htmlFor="specialPurpose" className="ml-3 text-sm font-medium text-gray-700">Special Purpose Room</label>
                </div>
              </div>
              <div className="p-4 bg-gray-100 border-t flex justify-end space-x-3 rounded-b-lg">
                <button type="button" onClick={() => setShowAddRoomForm(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold transition-colors">Create Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Room Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-start bg-gray-50 rounded-t-lg">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Room {selectedRoom.roomNumber}</h2>
                <p className="text-sm text-gray-600">{selectedRoom.purpose}</p>
              </div>
              <button onClick={() => setSelectedRoom(null)} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase">Occupancy</h3>
                  <p className="text-lg font-bold text-gray-800">{`${selectedRoom.currentOccupancy || 0} / ${selectedRoom.capacity}`}</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase">Special Purpose</h3>
                  <p className="text-lg font-bold text-gray-800">{selectedRoom.specialPurpose ? 'Yes' : 'No'}</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Room Members</h3>
              {loading ? (
                <p className="text-center text-gray-600">Loading students...</p>
              ) : students.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                  <p className="text-gray-500 font-semibold">No students assigned to this room.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map((student) => (
                    <div key={student._id} className="border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                      <button onClick={() => handleRemoveStudent(student._id, selectedRoom._id)} className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-100 border-t flex justify-end rounded-b-lg">
              <button onClick={() => setSelectedRoom(null)} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <form onSubmit={handleAddStudent}>
              <div className="p-6 border-b bg-gray-50 rounded-t-lg">
                <h2 className="text-xl font-semibold text-gray-800">Add New Student</h2>
              </div>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Room Selection */}
                <div>
                  <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">Assign to Room (Optional)</label>
                  <select 
                    id="roomNumber"
                    value={studentFormData.roomNumber}
                    onChange={(e) => setStudentFormData({...studentFormData, roomNumber: e.target.value})}
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Room (Optional)</option>
                    {rooms.map(room => (
                      <option key={room._id} value={room.roomNumber}>
                        {`Room ${room.roomNumber} (${room.currentOccupancy || 0}/${room.capacity})`}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Leave unassigned if not assigning to a room yet</p>
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    value={studentFormData.name}
                    onChange={(e) => setStudentFormData({...studentFormData, name: e.target.value})}
                    required 
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={studentFormData.email}
                    onChange={(e) => setStudentFormData({...studentFormData, email: e.target.value})}
                    required 
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    value={studentFormData.phone}
                    onChange={(e) => setStudentFormData({...studentFormData, phone: e.target.value})}
                    required 
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student ID</label>
                  <input 
                    type="text" 
                    id="studentId" 
                    value={studentFormData.studentId}
                    onChange={(e) => setStudentFormData({...studentFormData, studentId: e.target.value})}
                    required 
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>
                <div>
                  <label htmlFor="stream" className="block text-sm font-medium text-gray-700">Stream</label>
                  <select 
                    id="stream" 
                    value={studentFormData.stream}
                    onChange={(e) => setStudentFormData({...studentFormData, stream: e.target.value})}
                    required 
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Stream</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Medical">Medical</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Branch</label>
                  <input 
                    type="text" 
                    id="branch" 
                    value={studentFormData.branch}
                    onChange={(e) => setStudentFormData({...studentFormData, branch: e.target.value})}
                    required 
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
                  <select 
                    id="year" 
                    value={studentFormData.year}
                    onChange={(e) => setStudentFormData({...studentFormData, year: e.target.value})}
                    required 
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="college" className="block text-sm font-medium text-gray-700">College</label>
                  <input 
                    type="text" 
                    id="college" 
                    value={studentFormData.college}
                    onChange={(e) => setStudentFormData({...studentFormData, college: e.target.value})}
                    required 
                    className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>
              </div>
              <div className="p-4 bg-gray-100 border-t flex justify-end space-x-3 rounded-b-lg">
                <button 
                  type="button" 
                  onClick={() => setShowAddStudentModal(false)} 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-semibold transition-colors"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandaloneRooms;