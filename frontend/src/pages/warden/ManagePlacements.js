import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ManagePlacements = () => {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlacement, setSelectedPlacement] = useState(null);
  const [filters, setFilters] = useState({
    company: '',
    branch: '',
    year: '',
    searchTerm: ''
  });

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/placements');
      setPlacements(response.data.data || []);
    } catch (err) {
      console.error('Error fetching placements:', err);
      setError('Failed to load placements. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: e.target.value
    }));
  };

  const handleSelectPlacement = (placement) => {
    setSelectedPlacement(placement);
  };

  const handleCloseModal = () => {
    setSelectedPlacement(null);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Filter placements based on selected filters
  const filteredPlacements = placements.filter(placement => {
    // Filter by company
    if (filters.company && !placement.companyName.toLowerCase().includes(filters.company.toLowerCase())) return false;
    
    // Filter by branch
    if (filters.branch && placement.branch !== filters.branch) return false;
    
    // Filter by year
    if (filters.year && placement.year !== parseInt(filters.year)) return false;
    
    // Filter by search term
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const matchesCompany = placement.companyName.toLowerCase().includes(searchTerm);
      const matchesStudentName = placement.studentName.toLowerCase().includes(searchTerm);
      const matchesPosition = placement.jobRole.toLowerCase().includes(searchTerm);
      const matchesBranch = placement.branch.toLowerCase().includes(searchTerm);
      
      if (!matchesCompany && !matchesStudentName && !matchesPosition && !matchesBranch) return false;
    }
    
    return true;
  });

  // Get unique values for filter dropdowns
  const uniqueCompanies = [...new Set(placements.map(p => p.companyName))].sort();
  const uniqueBranches = [...new Set(placements.map(p => p.branch))].sort();
  const uniqueYears = [...new Set(placements.map(p => p.year))].sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={fetchPlacements}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Placement Details</h1>
        <p className="text-gray-600">View all student placement records and company details</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Filter Placements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by student, company, position..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <select
              name="company"
              value={filters.company}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Companies</option>
              {uniqueCompanies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              name="branch"
              value={filters.branch}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Branches</option>
              {uniqueBranches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Placements Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">
            Placement Records ({filteredPlacements.length})
          </h3>
        </div>
        
        {filteredPlacements.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No placements found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlacements.map((placement) => (
                  <tr key={placement._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{placement.studentName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{placement.companyName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{placement.jobRole}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{placement.branch}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{placement.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {placement.packageOffered ? `₹${placement.packageOffered.toLocaleString()}` : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Placement Statistics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Placement Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-800">Total Placements</h4>
            <p className="text-2xl font-semibold text-blue-600 mt-1">{placements.length}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-green-800">Companies</h4>
            <p className="text-2xl font-semibold text-green-600 mt-1">{uniqueCompanies.length}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-purple-800">Branches</h4>
            <p className="text-2xl font-semibold text-purple-600 mt-1">{uniqueBranches.length}</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-yellow-800">Average Package</h4>
            <p className="text-2xl font-semibold text-yellow-600 mt-1">
              {placements.length > 0 && placements.some(p => p.package)
                ? `₹${Math.round(placements.filter(p => p.package).reduce((sum, p) => sum + p.package, 0) / placements.filter(p => p.package).length).toLocaleString()}`
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Placement Details Modal */}
      {selectedPlacement && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Placement Details</h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Student Name</h4>
                    <p className="text-base text-gray-900">{selectedPlacement.studentName}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Company</h4>
                    <p className="text-base text-gray-900">{selectedPlacement.company}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Position</h4>
                    <p className="text-base text-gray-900">{selectedPlacement.position}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Branch</h4>
                    <p className="text-base text-gray-900">{selectedPlacement.branch}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Year</h4>
                    <p className="text-base text-gray-900">{selectedPlacement.year}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Package</h4>
                    <p className="text-base text-gray-900">
                      {selectedPlacement.package ? `₹${selectedPlacement.package.toLocaleString()}` : 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePlacements;
