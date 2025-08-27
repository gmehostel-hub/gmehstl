import React, { useState, useEffect } from 'react';
import simpleApi from '../../utils/simpleApi';

const ManagePlacements = () => {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    branch: '',
    year: '',
    companyName: '',
    jobRole: '',
    packageOffered: ''
  });
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');



  // Filter placements based on search term
  const filteredPlacements = placements.filter(placement => {
    const searchLower = searchTerm.toLowerCase();
    return (
      placement.studentName?.toLowerCase().includes(searchLower) ||
      placement.branch?.toLowerCase().includes(searchLower) ||
      placement.companyName?.toLowerCase().includes(searchLower) ||
      placement.jobRole?.toLowerCase().includes(searchLower) ||
      placement.year?.toString().includes(searchLower)
    );
  });

  const [students, setStudents] = useState([]);
  const [selectedPlacement, setSelectedPlacement] = useState(null);

  useEffect(() => {
    fetchPlacements();
    fetchStudents();
  }, []);

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const response = await simpleApi.get('/api/placements');
      setPlacements(response.data.data);
    } catch (err) {
      console.error('Error fetching placements:', err);
      setError('Failed to load placements. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await simpleApi.get('/api/users?role=student');
      if (response.data && response.data.data) {
        setStudents(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);

    try {
      if (formMode === 'add') {
        // Create new placement
        await simpleApi.post('/api/placements', formData);
        setFormSuccess('Placement record added successfully');
      } else {
        // Update existing placement
        await simpleApi.put(`/api/placements/${formData._id}`, formData);
        setFormSuccess('Placement record updated successfully');
      }

      // Reset form and fetch updated placements
      resetForm();
      setShowForm(false);
      fetchPlacements();
    } catch (err) {
      console.error('Error submitting placement:', err);
      console.error('Error response:', err.response);
      console.error('Form data being sent:', formData);
      
      let errorMessage = 'Failed to submit placement record. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setFormError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      studentName: '',
      branch: '',
      year: '',
      companyName: '',
      jobRole: '',
      packageOffered: ''
    });
  };

  const handleEdit = (placement) => {
    setFormMode('edit');
    setFormData({
      _id: placement._id,
      studentName: placement.studentName,
      branch: placement.branch,
      year: placement.year,
      companyName: placement.companyName,
      jobRole: placement.jobRole,
      packageOffered: placement.packageOffered
    });
    setShowForm(true);
    setFormError(null);
    setFormSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (placementId) => {
    if (!window.confirm('Are you sure you want to delete this placement record?')) {
      return;
    }

    try {
      await simpleApi.delete(`/api/placements/${placementId}`);
      setFormSuccess('Placement record deleted successfully');
      fetchPlacements();
      if (selectedPlacement && selectedPlacement._id === placementId) {
        setSelectedPlacement(null);
      }
    } catch (err) {
      console.error('Error deleting placement:', err);
      setFormError(err.response?.data?.message || 'Failed to delete placement record. Please try again.');
    }
  };

  const handleAddPlacement = () => {
    setFormMode('add');
    resetForm();
    setShowForm(true);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleViewPlacement = (placement) => {
    setSelectedPlacement(placement);
  };

  if (loading && placements.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error && placements.length === 0) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with action button */}
      <div className="bg-white shadow rounded-lg p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Manage Placements</h2>
          <p className="text-gray-600">Add, edit, and manage student placement records</p>
        </div>
        <button
          onClick={handleAddPlacement}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <i className="fas fa-plus mr-2"></i> Add Placement
        </button>
      </div>



      {/* Success/Error Messages */}
      {formSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-green-700">{formSuccess}</p>
        </div>
      )}

      {formError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{formError}</p>
        </div>
      )}

      {/* Placement Form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {formMode === 'add' ? 'Add New Placement Record' : 'Edit Placement Record'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">Student Name</label>
                <input type="text"
                  id="studentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  required
                  placeholder="Enter student name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Branch</label>
                <input type="text"
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Computer Science, Mechanical, etc."
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">Placement Year</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  min="2020"
                  max="2030"
                  placeholder="e.g., 2023, 2024, 2025"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required={formData.status === 'placed'}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="jobRole" className="block text-sm font-medium text-gray-700">Role/Position</label>
                <input
                  type="text"
                  id="jobRole"
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="packageOffered" className="block text-sm font-medium text-gray-700">Package (LPA)</label>
                <input
                  type="number"
                  id="packageOffered"
                  name="packageOffered"
                  value={formData.packageOffered}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>


            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed"
              >
                {formLoading ? 'Submitting...' : formMode === 'add' ? 'Add Placement' : 'Update Placement'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Placements List */}
        <div className="lg:w-2/3 bg-white shadow rounded-lg overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by student, company, branch, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Placements Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch & Placement Year
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company & Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package (LPA)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlacements.length > 0 ? (
                  filteredPlacements.map((placement) => (
                    <tr key={placement._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewPlacement(placement)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {placement.studentName || 'Unknown Student'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{placement.branch}</div>
                        <div className="text-xs text-gray-500">{placement.year ? `Placed in ${placement.year}` : 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{placement.companyName}</div>
                        <div className="text-xs text-gray-500">{placement.jobRole}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{placement.packageOffered} LPA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(placement);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(placement._id);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No placement records found matching the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Placement Details */}
        <div className="lg:w-1/3">
          {selectedPlacement ? (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-primary-600 text-white">
                <h3 className="text-lg leading-6 font-medium">Placement Details</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-xl font-semibold text-gray-800">{selectedPlacement.companyName}</h4>
                  <p className="text-gray-500">{selectedPlacement.jobRole}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700">Student</h5>
                    <p className="text-sm text-gray-600">
                      {selectedPlacement.student ? selectedPlacement.student.name : 'Unknown Student'}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700">Student ID</h5>
                    <p className="text-sm text-gray-600">
                      {selectedPlacement.student && selectedPlacement.student.studentId ? 
                        selectedPlacement.student.studentId : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700">Branch</h5>
                    <p className="text-sm text-gray-600">
                      {selectedPlacement.student && selectedPlacement.student.branch ? 
                        selectedPlacement.student.branch : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700">Year</h5>
                    <p className="text-sm text-gray-600">
                      {selectedPlacement.student && selectedPlacement.student.year ? 
                        `${selectedPlacement.student.year}${getOrdinalSuffix(selectedPlacement.student.year)} Year` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Placement Information</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h6 className="text-xs font-semibold text-gray-500">Branch</h6>
                      <p className="text-sm text-gray-600">{selectedPlacement.branch}</p>
                    </div>
                    <div>
                      <h6 className="text-xs font-semibold text-gray-500">Placement Year</h6>
                      <p className="text-sm text-gray-600">{selectedPlacement.year || 'N/A'}</p>
                    </div>
                    <div>
                      <h6 className="text-xs font-semibold text-gray-500">Package</h6>
                      <p className="text-sm text-gray-600">₹{selectedPlacement.packageOffered} LPA</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(selectedPlacement)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(selectedPlacement._id)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <i className="fas fa-briefcase text-3xl"></i>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No placement selected</h3>
              <p className="mt-1 text-sm text-gray-500">Select a placement record from the list to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get ordinal suffix for numbers
const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
};

export default ManagePlacements;