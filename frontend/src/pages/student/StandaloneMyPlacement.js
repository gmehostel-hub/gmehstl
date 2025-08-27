import React, { useState, useEffect } from 'react';
import simpleApi from '../../utils/simpleApi';

const StandaloneMyPlacement = () => {
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
    // Session persistence - stay on this page on refresh
    sessionStorage.setItem('lastVisitedPath', '/student/placements');
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      console.log('Fetching placements for student...');
      const response = await simpleApi.get('/api/placements');
      console.log('Placement API response:', response);
      console.log('Placement data:', response.data);
      if (response.data.success) {
        setPlacements(response.data.data || []);
        console.log('Placements set successfully:', response.data.data?.length || 0, 'items');
      }
    } catch (err) {
      console.error('Error fetching placements:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      setError(`Failed to load placements: ${err.response?.data?.message || err.message}`);
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Filter placements based on search and filter criteria
  const filteredPlacements = placements.filter(placement => {
    const matchesSearch = placement.studentName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         placement.companyName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         placement.jobRole.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesCompany = !filters.company || placement.companyName.toLowerCase().includes(filters.company.toLowerCase());
    const matchesBranch = !filters.branch || placement.branch.toLowerCase().includes(filters.branch.toLowerCase());
    const matchesYear = !filters.year || placement.year.toString() === filters.year;
    
    return matchesSearch && matchesCompany && matchesBranch && matchesYear;
  });

  // Get unique values for filter dropdowns
  const uniqueCompanies = [...new Set(placements.map(p => p.companyName))];
  const uniqueBranches = [...new Set(placements.map(p => p.branch))];
  const uniqueYears = [...new Set(placements.map(p => p.year))];

  const closeModal = () => {
    setSelectedPlacement(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
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
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800">Placements</h2>
        <p className="text-gray-600">View all student placements</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <input
              type="text"
              placeholder="Search students, companies, or roles..."
              value={filters.searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              name="company"
              value={filters.company}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Companies</option>
              {uniqueCompanies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              name="branch"
              value={filters.branch}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Branches</option>
              {uniqueBranches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        {filteredPlacements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                      <div className="text-sm text-gray-900">{formatCurrency(placement.packageOffered)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleSelectPlacement(placement)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <i className="fas fa-briefcase text-6xl"></i>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Placements Found</h3>
            <p className="mt-2 text-gray-500">
              No placement records match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        )}
      </div>

      {/* Placement Details Modal */}
      {selectedPlacement && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Placement Details
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {/* Modal Content */}
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPlacement.studentName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPlacement.companyName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Job Role</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPlacement.jobRole}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Branch</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPlacement.branch}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPlacement.year}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Package Offered</label>
                    <p className="mt-1 text-sm text-gray-900 font-semibold">
                      {formatCurrency(selectedPlacement.packageOffered)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandaloneMyPlacement; 