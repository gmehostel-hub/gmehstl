import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const AssignStudents = () => {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    email: '',
    studentId: '',
    year: 1,
    branch: 'CSE',
    college: 'Engineering College A',
    phoneNumber: ''
  });

  const branches = ['CSE', 'ECE', 'ME', 'CE', 'EE'];
  const colleges = ['Engineering College A', 'Engineering College B', 'Arts College', 'Science College'];

  useEffect(() => {
    fetchRooms();
    fetchStudents();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/api/rooms');
      setRooms(response.data.data || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/users?role=student');
      const allStudents = response.data.data || [];
      setStudents(allStudents);
      
      // Filter unassigned students
      const unassigned = allStudents.filter(student => !student.roomNumber);
      setUnassignedStudents(unassigned);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleAssignStudents = async () => {
    if (!selectedRoom || selectedStudents.length === 0) {
      setError('Please select a room and at least one student');
      return;
    }

    const room = rooms.find(r => r._id === selectedRoom);
    if (!room) {
      setError('Selected room not found');
      return;
    }

    // Check room capacity
    const currentOccupancy = room.currentOccupancy || 0;
    const availableSpace = room.capacity - currentOccupancy;
    
    if (selectedStudents.length > availableSpace) {
      setError(`Room ${room.roomNumber} only has ${availableSpace} available spaces`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Assign each selected student to the room
      for (const studentId of selectedStudents) {
        await api.post(`/api/rooms/number/${room.roomNumber}/assign/${studentId}`);
      }

      setSuccess(`Successfully assigned ${selectedStudents.length} student(s) to Room ${room.roomNumber}`);
      
      // Reset selections and refresh data
      setSelectedStudents([]);
      setSelectedRoom('');
      fetchRooms();
      fetchStudents();
      
    } catch (err) {
      console.error('Error assigning students:', err);
      setError(err.response?.data?.message || 'Failed to assign students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/api/users', {
        ...newStudentData,
        role: 'student',
        password: 'student123' // Default password
      });

      setSuccess('Student created successfully!');
      setShowAddStudentForm(false);
      setNewStudentData({
        name: '',
        email: '',
        studentId: '',
        year: 1,
        branch: 'CSE',
        college: 'Engineering College A',
        phoneNumber: ''
      });
      
      fetchStudents();
      
    } catch (err) {
      console.error('Error creating student:', err);
      setError(err.response?.data?.message || 'Failed to create student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudentFromRoom = async (studentId, roomNumber) => {
    if (!window.confirm('Are you sure you want to remove this student from the room?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.delete(`/api/rooms/number/${roomNumber}/remove/${studentId}`);
      setSuccess('Student removed from room successfully');
      fetchRooms();
      fetchStudents();
    } catch (err) {
      console.error('Error removing student:', err);
      setError(err.response?.data?.message || 'Failed to remove student from room.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUnassignedStudents = unassignedStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedRoomData = rooms.find(r => r._id === selectedRoom);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Assign Students to Rooms</h2>
        
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Selection and Assignment */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Room</h3>
            
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="">Choose a room...</option>
              {rooms.map(room => (
                <option key={room._id} value={room._id}>
                  Room {room.roomNumber} - {room.purpose} 
                  ({room.currentOccupancy || 0}/{room.capacity} occupied)
                </option>
              ))}
            </select>

            {selectedRoomData && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800">Room {selectedRoomData.roomNumber} Details</h4>
                <p className="text-blue-600">Purpose: {selectedRoomData.purpose}</p>
                <p className="text-blue-600">
                  Capacity: {selectedRoomData.currentOccupancy || 0}/{selectedRoomData.capacity}
                </p>
                <p className="text-blue-600">
                  Available spaces: {selectedRoomData.capacity - (selectedRoomData.currentOccupancy || 0)}
                </p>
              </div>
            )}

            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">
                Selected Students ({selectedStudents.length})
              </h4>
              {selectedStudents.length > 0 ? (
                <div className="space-y-1">
                  {selectedStudents.map(studentId => {
                    const student = unassignedStudents.find(s => s._id === studentId);
                    return student ? (
                      <div key={studentId} className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {student.name} ({student.studentId})
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No students selected</p>
              )}
            </div>

            <button
              onClick={handleAssignStudents}
              disabled={loading || !selectedRoom || selectedStudents.length === 0}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Assigning...' : `Assign ${selectedStudents.length} Student(s)`}
            </button>
          </div>

          {/* Unassigned Students */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Unassigned Students ({unassignedStudents.length})
              </h3>
              <button
                onClick={() => setShowAddStudentForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add Student
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredUnassignedStudents.map(student => (
                <div
                  key={student._id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedStudents.includes(student._id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleStudentSelection(student._id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">{student.name}</h4>
                      <p className="text-sm text-gray-600">{student.studentId}</p>
                      <p className="text-sm text-gray-500">
                        {student.year} Year, {student.branch}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => handleStudentSelection(student._id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
              
              {filteredUnassignedStudents.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  {searchTerm ? 'No students found matching your search' : 'No unassigned students'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Room Occupancy Overview */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Room Occupancy Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {rooms.map(room => (
              <div
                key={room._id}
                className={`p-4 rounded-lg border-2 ${
                  room.currentOccupancy >= room.capacity
                    ? 'border-red-200 bg-red-50'
                    : room.currentOccupancy === 0
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-green-200 bg-green-50'
                }`}
              >
                <div className="text-center">
                  <h4 className="font-medium text-gray-800">Room {room.roomNumber}</h4>
                  <p className="text-sm text-gray-600">{room.purpose}</p>
                  <p className="text-lg font-semibold mt-2">
                    {room.currentOccupancy || 0}/{room.capacity}
                  </p>
                  <div className="mt-2">
                    {room.students && room.students.length > 0 && (
                      <div className="space-y-1">
                        {students
                          .filter(student => student.roomNumber === room.roomNumber)
                          .map(student => (
                            <div key={student._id} className="text-xs text-gray-500 flex justify-between items-center">
                              <span>{student.name}</span>
                              <button
                                onClick={() => handleRemoveStudentFromRoom(student._id, room.roomNumber)}
                                className="text-red-500 hover:text-red-700 ml-1"
                                title="Remove student"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Student Modal */}
        {showAddStudentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Student</h3>
              
              <form onSubmit={handleCreateStudent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={newStudentData.name}
                    onChange={(e) => setNewStudentData({...newStudentData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newStudentData.email}
                    onChange={(e) => setNewStudentData({...newStudentData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
                  <input
                    type="text"
                    value={newStudentData.studentId}
                    onChange={(e) => setNewStudentData({...newStudentData, studentId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <select
                      value={newStudentData.year}
                      onChange={(e) => setNewStudentData({...newStudentData, year: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <select
                      value={newStudentData.branch}
                      onChange={(e) => setNewStudentData({...newStudentData, branch: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {branches.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                  <select
                    value={newStudentData.college}
                    onChange={(e) => setNewStudentData({...newStudentData, college: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {colleges.map(college => (
                      <option key={college} value={college}>{college}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newStudentData.phoneNumber}
                    onChange={(e) => setNewStudentData({...newStudentData, phoneNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddStudentForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating...' : 'Create Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignStudents;
