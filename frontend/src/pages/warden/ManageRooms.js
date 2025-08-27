import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPurpose, setFilterPurpose] = useState('all');
  const [filterOccupancy, setFilterOccupancy] = useState('all');
  const [viewingStudent, setViewingStudent] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentFilterBranch, setStudentFilterBranch] = useState('all');

  const roomPurposes = [
    { value: 'all', label: 'All Purposes' },
    { value: 'Regular', label: 'Regular' },
    { value: 'Cooking Staff Room', label: 'Cooking Staff Room' },
    { value: 'Digital Lab 1', label: 'Digital Lab 1' },
    { value: 'Book Library', label: 'Book Library' },
    { value: 'Warden Office', label: 'Warden Office' },
    { value: 'Store Room', label: 'Store Room' },
    { value: 'Digital Lab 2', label: 'Digital Lab 2' }
  ];

  const occupancyStatuses = [
    { value: 'all', label: 'All Occupancy' },
    { value: 'empty', label: 'Empty' },
    { value: 'partial', label: 'Partially Filled' },
    { value: 'full', label: 'Full' }
  ];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/rooms');
      setRooms(response.data.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomStudents = async (roomId) => {
    try {
      const response = await api.get(`/api/rooms/${roomId}`);
      if (response.data.data.students && response.data.data.students.length > 0) {
        // Get detailed student information using the same approach as admin
        const studentsResponse = await api.get(`/api/users?role=student&_id=${response.data.data.students.join(',')}`);
        setStudents(studentsResponse.data.data);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error('Error fetching room students:', err);
      setStudents([]);
    }
  };

  const handleRoomSelect = async (room) => {
    setSelectedRoom(room);
    await fetchRoomStudents(room._id);
  };

  const handleViewStudentDetails = (student) => {
    setViewingStudent(student);
    setShowStudentDetails(true);
  };

  const closeStudentDetails = () => {
    setShowStudentDetails(false);
    setViewingStudent(null);
  };

  const closeRoomDetails = () => {
    setSelectedRoom(null);
    setStudents([]);
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toString().includes(searchTerm) ||
                         room.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPurpose = filterPurpose === 'all' || room.purpose === filterPurpose;
    
    let matchesOccupancy = true;
    if (filterOccupancy === 'empty') {
      matchesOccupancy = room.currentOccupancy === 0;
    } else if (filterOccupancy === 'partial') {
      matchesOccupancy = room.currentOccupancy > 0 && room.currentOccupancy < room.capacity;
    } else if (filterOccupancy === 'full') {
      matchesOccupancy = room.currentOccupancy === room.capacity;
    }
    
    return matchesSearch && matchesPurpose && matchesOccupancy;
  });

  const filteredStudents = useMemo(() => {
    if (!selectedRoom || !selectedRoom.students) {
      return [];
    }
    return selectedRoom.students.filter(student => {
      const searchTermLower = studentSearchTerm.toLowerCase();
      const matchesSearch = student.name.toLowerCase().includes(searchTermLower) ||
                            (student.studentId && student.studentId.toLowerCase().includes(searchTermLower));
      const matchesBranch = studentFilterBranch === 'all' || student.branch === studentFilterBranch;
      return matchesSearch && matchesBranch;
    });
  }, [selectedRoom, studentSearchTerm, studentFilterBranch]);

  const roomStats = {
    total: rooms.length,
    occupied: rooms.filter(r => r.currentOccupancy > 0).length,
    empty: rooms.filter(r => r.currentOccupancy === 0).length,
    full: rooms.filter(r => r.currentOccupancy === r.capacity).length,
    specialPurpose: rooms.filter(r => r.specialPurpose).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with statistics */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Room Details</h2>
            <p className="text-gray-600">View all hostel rooms and student assignments</p>
          </div>
        </div>
        
        {/* Room Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{roomStats.total}</div>
            <div className="text-sm text-blue-600">Total Rooms</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{roomStats.occupied}</div>
            <div className="text-sm text-green-600">Occupied</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{roomStats.empty}</div>
            <div className="text-sm text-gray-600">Empty</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{roomStats.full}</div>
            <div className="text-sm text-red-600">Full</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{roomStats.specialPurpose}</div>
            <div className="text-sm text-purple-600">Special Purpose</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search by Room Number or Purpose */}
            <div>
              <label htmlFor="search-rooms" className="block text-sm font-medium text-gray-700 mb-1">
                Search Rooms
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
                <input
                  type="text"
                  id="search-rooms"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Room number or purpose..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Filter by Purpose */}
            <div>
              <label htmlFor="filter-purpose" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Purpose
              </label>
              <select
                id="filter-purpose"
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={filterPurpose}
                onChange={(e) => setFilterPurpose(e.target.value)}
              >
                {roomPurposes.map(purpose => (
                  <option key={purpose.value} value={purpose.value}>{purpose.label}</option>
                ))}
              </select>
            </div>

            {/* Filter by Occupancy */}
            <div>
              <label htmlFor="filter-occupancy" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Occupancy
              </label>
              <select
                id="filter-occupancy"
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={filterOccupancy}
                onChange={(e) => setFilterOccupancy(e.target.value)}
              >
                {occupancyStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Room List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-primary-600 text-white">
          <h3 className="text-lg leading-6 font-medium">All Rooms ({filteredRooms.length})</h3>
          <p className="mt-1 max-w-2xl text-sm">Click on any room to view detailed information and student assignments</p>
        </div>
        
        {filteredRooms.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <i className="fas fa-search text-4xl mb-4"></i>
            <p>No rooms found matching your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRooms.map((room) => (
              <div
                key={room._id}
                onClick={() => handleRoomSelect(room)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">Room {room.roomNumber}</h4>
                      {room.specialPurpose && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Special Purpose
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{room.purpose}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>
                        <i className="fas fa-users mr-1"></i>
                        Occupancy: {room.currentOccupancy}/{room.capacity}
                      </span>
                      <span>
                        <i className="fas fa-percentage mr-1"></i>
                        {room.capacity > 0 ? Math.round((room.currentOccupancy / room.capacity) * 100) : 0}% Full
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {room.currentOccupancy === 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Empty
                      </span>
                    )}
                    {room.currentOccupancy > 0 && room.currentOccupancy < room.capacity && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Partial
                      </span>
                    )}
                    {room.currentOccupancy === room.capacity && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Full
                      </span>
                    )}
                    <i className="fas fa-chevron-right text-gray-400"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Room Details Popup Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={closeRoomDetails}>
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Room {selectedRoom.roomNumber} Details</h3>
              <button
                onClick={closeRoomDetails}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-semibold text-gray-700">Purpose</h5>
                  <p className="text-sm text-gray-600">{selectedRoom.purpose}</p>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-700">Special Purpose</h5>
                  <p className="text-sm text-gray-600">{selectedRoom.specialPurpose ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-700">Capacity</h5>
                  <p className="text-sm text-gray-600">{selectedRoom.capacity}</p>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-700">Current Occupancy</h5>
                  <p className="text-sm text-gray-600">{selectedRoom.currentOccupancy}</p>
                </div>
              </div>

              {/* Students in Room */}
              <div>
                <div className="my-4 p-3 bg-gray-100 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="student-search" className="text-sm font-medium text-gray-700">Search Students</label>
                      <input 
                        type="text"
                        id="student-search"
                        placeholder="Name or Student ID..."
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                        className="mt-1 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="student-filter-branch" className="text-sm font-medium text-gray-700">Filter by Branch</label>
                      <select
                        id="student-filter-branch"
                        value={studentFilterBranch}
                        onChange={(e) => setStudentFilterBranch(e.target.value)}
                        className="mt-1 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                      >
                        <option value="all">All Branches</option>
                        {[...new Set(students.map(s => s.branch))].map(branch => (
                          branch && <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-sm font-semibold text-gray-700">Students in Room ({filteredStudents.length})</h5>
                  <div className="text-xs text-gray-500">
                    {selectedRoom.currentOccupancy}/{selectedRoom.capacity} students
                  </div>
                </div>
                
                <ul className="space-y-3 mt-4 max-h-96 overflow-y-auto pr-2">
                  {filteredStudents.map(student => (
                    <li key={student._id} className="p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleViewStudentDetails(student)}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                          <div className="grid grid-cols-2 gap-x-4 mt-1">
                            {student.studentId && (
                              <p className="text-xs text-gray-500">ID: {student.studentId}</p>
                            )}
                            {student.phoneNumber && (
                              <p className="text-xs text-gray-500">Phone: {student.phoneNumber}</p>
                            )}
                            <p className="text-xs text-gray-500 italic">Click for more details</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          <i className="fas fa-eye"></i>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {showStudentDetails && viewingStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={closeStudentDetails}>
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Student Details</h3>
              <button onClick={closeStudentDetails} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingStudent.name}</p>
                </div>
                <div>
                  <div><label className="block text-sm font-medium text-gray-700">Email</label><p className="mt-1 text-sm text-gray-900">{viewingStudent.email}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700">Student ID</label><p className="mt-1 text-sm text-gray-900">{viewingStudent.studentId || 'N/A'}</p></div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingStudent.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingStudent.year || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingStudent.branch || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">College</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingStudent.college || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Number</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingStudent.roomNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeStudentDetails}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
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

export default ManageRooms;
