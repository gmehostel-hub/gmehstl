import React, { useState, useEffect } from 'react';
import simpleApi from '../../utils/simpleApi';
import { useNavigate } from 'react-router-dom';

const StandalonePlacements = () => {
  const navigate = useNavigate();
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
  const [selectedPlacement, setSelectedPlacement] = useState(null);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Prevent accidental navigation
  useEffect(() => {
    // Save to session storage that we're on this page
    sessionStorage.setItem('currentPage', '/admin/placements');
    
    // Define beforeunload handler to prevent accidental page leaves
    const handleBeforeUnload = (e) => {
      const message = "Are you sure you want to leave this page? Your changes might not be saved.";
      e.returnValue = message;
      return message;
    };
    
    // Only add event listener if we're on the placements page
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  // Check if we should return to this page on refresh
  useEffect(() => {
    const savedPage = sessionStorage.getItem('currentPage');
    if (savedPage === '/admin/placements' && window.location.pathname !== '/admin/placements') {
      navigate('/admin/placements');
    }
  }, [navigate]);

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

  useEffect(() => {
    console.log('StandalonePlacements component mounted');
    fetchPlacements();
    fetchStudents();
    
    return () => {
      console.log('StandalonePlacements component unmounting');
    };
  }, []);

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching placements...');
      
      const response = await simpleApi.get('/api/placements');
      console.log('Placements API response:', response);
      
      if (response && response.data && response.data.data) {
        setPlacements(response.data.data);
      } else {
        setPlacements([]);
        console.warn('No placements data in response:', response);
      }
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
      // Debug: Check authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        setFormError('Authentication token not found. Please log in again.');
        setFormLoading(false);
        return;
      }
      
      console.log('Submitting placement with data:', formData);
      console.log('Token exists:', !!token);
      
      if (formMode === 'add') {
        // Create new placement with enhanced error logging
        console.log('Creating new placement...');
        const response = await simpleApi.post('/api/placements', formData);
        console.log('Placement creation response:', response.data);
        setFormSuccess('Placement record added successfully and saved to database!');
      } else {
        // Update existing placement
        console.log('Updating placement with ID:', formData._id);
        const response = await simpleApi.put(`/api/placements/${formData._id}`, formData);
        console.log('Placement update response:', response.data);
        setFormSuccess('Placement record updated successfully in database!');
      }

      // Reset form and fetch updated placements
      resetForm();
      setShowForm(false);
      
      // Add a small delay to ensure database write is complete
      setTimeout(() => {
        fetchPlacements();
      }, 500);
      
    } catch (err) {
      console.error('Error submitting placement:', err);
      console.error('Error response status:', err.response?.status);
      console.error('Error response data:', err.response?.data);
      
      let errorMessage = 'Failed to submit placement record. Please try again.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again and try.';
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else if (err.response?.data?.message) {
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
        setShowModal(false);
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
    setShowModal(true);
  };

  // Add keyboard listener for modal escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    
    // Prevent body scrolling when modal is open
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (formSuccess) {
      const timer = setTimeout(() => {
        setFormSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formSuccess]);

  if (loading && placements.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading placements...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        {/* Header with action button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Manage Placements</h1>
            <p className="text-gray-600">Add, edit, and manage student placement records</p>
          </div>
          <button
            onClick={handleAddPlacement}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2"
          >
            <i className="fas fa-plus mr-2"></i> Add Placement
          </button>
        </div>

        {/* Success/Error Messages */}
        {formSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
            <p className="text-green-700">{formSuccess}</p>
          </div>
        )}

        {formError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-700">{formError}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchPlacements}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Placement Form */}
        {showForm && (
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {formMode === 'add' ? 'Add New Placement Record' : 'Edit Placement Record'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                  <input type="text"
                    id="studentName"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    required
                    placeholder="Enter student name"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                  <input type="text"
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Computer Science, Mechanical, etc."
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Placement Year</label>
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
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    placeholder="Company name"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="jobRole" className="block text-sm font-medium text-gray-700 mb-1">Role/Position</label>
                  <input
                    type="text"
                    id="jobRole"
                    name="jobRole"
                    value={formData.jobRole}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Software Engineer, Analyst"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="packageOffered" className="block text-sm font-medium text-gray-700 mb-1">Package (LPA)</label>
                  <input
                    type="number"
                    id="packageOffered"
                    name="packageOffered"
                    value={formData.packageOffered}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="Annual package in lakhs"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {formLoading ? 'Submitting...' : formMode === 'add' ? 'Add Placement' : 'Update Placement'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Placements List */}
        <div className="bg-white border rounded-lg overflow-hidden">
          {/* Search Filter */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by student, company, branch, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button 
                onClick={fetchPlacements}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading placements...</p>
            </div>
          ) : placements.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <p className="mt-2 text-gray-600">No placement records found. Add your first placement above.</p>
            </div>
          ) : filteredPlacements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No placement records match your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch & Year
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
                  {filteredPlacements.map((placement) => (
                    <tr key={placement._id} className="hover:bg-gray-50">
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
                            onClick={() => handleViewPlacement(placement)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(placement);
                            }}
                            className="text-green-600 hover:text-green-900"
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Placement Details Modal */}
      {showModal && selectedPlacement && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 md:mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-blue-600 text-white">
              <h2 className="text-xl font-semibold">
                {selectedPlacement.companyName} - Placement Details
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800">{selectedPlacement.companyName}</h3>
                <p className="text-gray-600">{selectedPlacement.jobRole}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border rounded p-3">
                  <h4 className="text-sm font-semibold text-gray-500">Student Name</h4>
                  <p>{selectedPlacement.studentName}</p>
                </div>
                <div className="border rounded p-3">
                  <h4 className="text-sm font-semibold text-gray-500">Branch</h4>
                  <p>{selectedPlacement.branch}</p>
                </div>
                <div className="border rounded p-3">
                  <h4 className="text-sm font-semibold text-gray-500">Placement Year</h4>
                  <p>{selectedPlacement.year || 'N/A'}</p>
                </div>
                <div className="border rounded p-3">
                  <h4 className="text-sm font-semibold text-gray-500">Package</h4>
                  <p>₹{selectedPlacement.packageOffered} LPA</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Additional Information</h4>
                <p className="text-gray-600">
                  This placement record was created for {selectedPlacement.studentName} in the {selectedPlacement.branch} branch. 
                  The student was placed at {selectedPlacement.companyName} as a {selectedPlacement.jobRole} with an annual 
                  package of ₹{selectedPlacement.packageOffered} lakhs per annum.
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  handleEdit(selectedPlacement);
                }}
                className="px-4 py-2 mr-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedPlacement._id);
                }}
                className="px-4 py-2 mr-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
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

export default StandalonePlacements;