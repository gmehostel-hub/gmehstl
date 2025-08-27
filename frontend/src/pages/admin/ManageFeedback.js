import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ManageFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [isResolved, setIsResolved] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [responseLoading, setResponseLoading] = useState(false);
  const [responseError, setResponseError] = useState(null);
  const [responseSuccess, setResponseSuccess] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    rating: '',
    searchTerm: ''
  });

  // Categories for feedback
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'hostel', label: 'Hostel Facilities' },
    { value: 'food', label: 'Food & Canteen' },
    { value: 'cleanliness', label: 'Cleanliness' },
    { value: 'staff', label: 'Staff Behavior' },
    { value: 'internet', label: 'Internet Connectivity' },
    { value: 'security', label: 'Security' },
    { value: 'other', label: 'Other' }
  ];

  // Statuses for filtering
  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'responded', label: 'Responded' },
    { value: 'resolved', label: 'Resolved' }
  ];

  // Priorities for filtering and setting
  const priorities = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent Priority' }
  ];

  // Ratings for filtering
  const ratings = [
    { value: '', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ];

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/feedback');
      setFeedbacks(response.data);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError('Failed to load feedbacks. Please try again later.');
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

  const handleSelectFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.response || '');
    setIsResolved(feedback.isResolved || false);
    setPriority(feedback.priority || 'medium');
    setResponseError(null);
    setResponseSuccess(null);
  };

  const handleResponseChange = (e) => {
    setResponseText(e.target.value);
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;

    setResponseError(null);
    setResponseSuccess(null);
    setResponseLoading(true);

    try {
      console.log('Submitting response for feedback:', selectedFeedback._id);
      console.log('Request data:', { 
        response: responseText,
        isResolved: isResolved,
        priority: priority
      });
      
      const response = await api.post(`/api/feedback/${selectedFeedback._id}/respond`, { 
        response: responseText,
        isResolved: isResolved,
        priority: priority
      });
      
      console.log('Response received:', response.data);
      
      // Handle different response structures
      const updatedFeedback = response.data.data || response.data;
      
      if (!updatedFeedback || !updatedFeedback._id) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response from server');
      }
      
      setResponseSuccess(response.data.message || 'Response submitted successfully');
      
      // Update the feedback in the list with safe checks
      setFeedbacks(prev => {
        if (!prev || !Array.isArray(prev)) {
          console.error('Feedbacks array is invalid:', prev);
          return prev;
        }
        
        return prev.map(feedback => {
          if (feedback && feedback._id === selectedFeedback._id) {
            console.log('Updating feedback in list:', updatedFeedback);
            return updatedFeedback;
          }
          return feedback;
        });
      });
      
      // Update selected feedback
      console.log('Setting selected feedback:', updatedFeedback);
      setSelectedFeedback(updatedFeedback);
      
      // Update form state to match the response
      setResponseText(updatedFeedback.response || '');
      setIsResolved(updatedFeedback.isResolved || false);
      setPriority(updatedFeedback.priority || 'medium');
      
    } catch (err) {
      console.error('Error submitting response:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setResponseError(err.response?.data?.message || err.message || 'Failed to submit response. Please try again.');
    } finally {
      setResponseLoading(false);
    }
  };

  // Function to handle quick resolution toggle
  const handleQuickResolve = async (feedbackId, resolveStatus) => {
    try {
      const response = await api.patch(`/api/feedback/${feedbackId}/resolve`, { 
        isResolved: resolveStatus 
      });
      
      const updatedFeedback = response.data.data;
      
      // Update the feedback in the list
      setFeedbacks(prev => prev.map(feedback => {
        if (feedback._id === feedbackId) {
          return updatedFeedback;
        }
        return feedback;
      }));
      
      // Update selected feedback if it's the same one
      if (selectedFeedback && selectedFeedback._id === feedbackId) {
        setSelectedFeedback(updatedFeedback);
        setIsResolved(updatedFeedback.isResolved);
      }
    } catch (err) {
      console.error('Error updating resolution status:', err);
      setResponseError(err.response?.data?.message || 'Failed to update resolution status.');
    }
  };

  // Helper function to get category label
  const getCategoryLabel = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Filter feedbacks based on selected filters
  const filteredFeedbacks = feedbacks.filter(feedback => {
    // Category filter
    if (filters.category && feedback.category !== filters.category) {
      return false;
    }
    
    // Status filter
    if (filters.status) {
      let feedbackStatus;
      if (feedback.isResolved) {
        feedbackStatus = 'resolved';
      } else if (feedback.response) {
        feedbackStatus = 'responded';
      } else {
        feedbackStatus = 'pending';
      }
      
      if (feedbackStatus !== filters.status) {
        return false;
      }
    }
    
    // Rating filter
    if (filters.rating && feedback.rating.toString() !== filters.rating) {
      return false;
    }
    
    // Search term filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const studentName = feedback.student?.name?.toLowerCase() || '';
      const comment = feedback.comment.toLowerCase();
      const category = getCategoryLabel(feedback.category).toLowerCase();
      
      if (!studentName.includes(searchTerm) && 
          !comment.includes(searchTerm) && 
          !category.includes(searchTerm)) {
        return false;
      }
    }
    
    return true;
  });

  if (loading && feedbacks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800">Manage Feedback</h2>
        <p className="text-gray-600">Review and respond to student feedback</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Feedback List */}
        <div className="lg:w-2/3 bg-white shadow rounded-lg overflow-hidden">
          {/* Filters */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="category" className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="rating" className="block text-xs font-medium text-gray-700 mb-1">Rating</label>
                <select
                  id="rating"
                  name="rating"
                  value={filters.rating}
                  onChange={handleFilterChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  {ratings.map(rating => (
                    <option key={rating.value} value={rating.value}>{rating.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by comment or student"
                  value={filters.searchTerm}
                  onChange={handleSearchChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Feedback List */}
          <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
            {filteredFeedbacks.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredFeedbacks.map((feedback) => (
                  <li 
                    key={feedback._id} 
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedFeedback?._id === feedback._id ? 'bg-blue-50' : ''}`}
                    onClick={() => handleSelectFeedback(feedback)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{getCategoryLabel(feedback.category)}</h4>
                        <div className="flex items-center mt-1">
                          <p className="text-xs text-gray-500 mr-2">{formatDate(feedback.createdAt)}</p>
                          {!feedback.response && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                          {feedback.response && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Responded
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-sm">
                            {star <= feedback.rating ? (
                              <span className="text-yellow-400">★</span>
                            ) : (
                              <span className="text-gray-300">★</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{feedback.comment}</p>
                    {!feedback.anonymous && feedback.student && (
                      <p className="mt-1 text-xs text-gray-500">
                        By: {feedback.student.name} ({feedback.student.email})
                      </p>
                    )}
                    {feedback.anonymous && (
                      <p className="mt-1 text-xs text-gray-500 italic">
                        Anonymous submission
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>No feedbacks found matching the selected filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Detail & Response */}
        <div className="lg:w-1/3 bg-white shadow rounded-lg overflow-hidden">
          {selectedFeedback ? (
            <div>
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">Feedback Details</h3>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500">Category</h4>
                  <p className="text-base">{getCategoryLabel(selectedFeedback.category)}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500">Rating</h4>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-lg">
                        {star <= selectedFeedback.rating ? (
                          <span className="text-yellow-400">★</span>
                        ) : (
                          <span className="text-gray-300">★</span>
                        )}
                      </span>
                    ))}
                    <span className="ml-2 text-sm text-gray-500">
                      {selectedFeedback.rating === 1 && 'Poor'}
                      {selectedFeedback.rating === 2 && 'Fair'}
                      {selectedFeedback.rating === 3 && 'Good'}
                      {selectedFeedback.rating === 4 && 'Very Good'}
                      {selectedFeedback.rating === 5 && 'Excellent'}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500">Date Submitted</h4>
                  <p className="text-base">{formatDate(selectedFeedback.createdAt)}</p>
                </div>
                
                {!selectedFeedback.anonymous && selectedFeedback.student && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Student</h4>
                    <p className="text-base">{selectedFeedback.student.name}</p>
                    <p className="text-sm text-gray-500">{selectedFeedback.student.email}</p>
                    {selectedFeedback.student.registrationNumber && (
                      <p className="text-sm text-gray-500">Reg: {selectedFeedback.student.registrationNumber}</p>
                    )}
                  </div>
                )}
                
                {selectedFeedback.anonymous && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Student</h4>
                    <p className="text-base italic">Anonymous submission</p>
                  </div>
                )}
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500">Feedback</h4>
                  <p className="text-base mt-1 whitespace-pre-wrap">{selectedFeedback.comment}</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Response</h4>
                  
                  {/* Success/Error Messages */}
                  {responseSuccess && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-3 rounded">
                      <p className="text-green-700 text-sm">{responseSuccess}</p>
                    </div>
                  )}
                  
                  {responseError && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
                      <p className="text-red-700 text-sm">{responseError}</p>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmitResponse}>
                    {/* Current Status Display */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Current Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedFeedback.isResolved 
                            ? 'bg-green-100 text-green-800' 
                            : selectedFeedback.response 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedFeedback.isResolved ? (
                            <>
                              <i className="fas fa-check-circle mr-1"></i>
                              Resolved
                            </>
                          ) : selectedFeedback.response ? (
                            <>
                              <i className="fas fa-clock mr-1"></i>
                              Under Review
                            </>
                          ) : (
                            <>
                              <i className="fas fa-hourglass-half mr-1"></i>
                              Pending
                            </>
                          )}
                        </span>
                      </div>
                      {selectedFeedback.priority && (
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-medium text-gray-700">Priority:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedFeedback.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            selectedFeedback.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            selectedFeedback.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedFeedback.priority.charAt(0).toUpperCase() + selectedFeedback.priority.slice(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Response Text */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Response Message
                      </label>
                      <textarea
                        value={responseText}
                        onChange={handleResponseChange}
                        rows="4"
                        placeholder="Type your response here..."
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        required
                      ></textarea>
                    </div>

                    {/* Priority Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Set Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        {priorities.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Resolution Status */}
                    <div className="mb-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isResolved"
                          checked={isResolved}
                          onChange={(e) => setIsResolved(e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isResolved" className="ml-2 block text-sm text-gray-900">
                          Mark as resolved
                        </label>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Check this box if the issue has been fully addressed and resolved
                      </p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={responseLoading}
                        className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed"
                      >
                        {responseLoading ? 'Submitting...' : 'Submit Response'}
                      </button>
                      
                      {/* Quick Resolution Toggle */}
                      <button
                        type="button"
                        onClick={() => handleQuickResolve(selectedFeedback._id, !selectedFeedback.isResolved)}
                        className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          selectedFeedback.isResolved
                            ? 'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:ring-yellow-500'
                            : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100 focus:ring-green-500'
                        }`}
                      >
                        <i className={`fas ${selectedFeedback.isResolved ? 'fa-undo' : 'fa-check'} mr-1`}></i>
                        {selectedFeedback.isResolved ? 'Unresolve' : 'Quick Resolve'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>Select a feedback from the list to view details and respond.</p>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Statistics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Feedback Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-800">Total Feedbacks</h4>
            <p className="text-2xl font-semibold text-blue-600 mt-1">{(feedbacks || []).length}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-green-800">Resolved</h4>
            <p className="text-2xl font-semibold text-green-600 mt-1">
              {(feedbacks || []).filter(f => f && f.isResolved).length}
            </p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-yellow-800">Under Review</h4>
            <p className="text-2xl font-semibold text-yellow-600 mt-1">
              {(feedbacks || []).filter(f => f && f.response && !f.isResolved).length}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-800">Pending</h4>
            <p className="text-2xl font-semibold text-gray-600 mt-1">
              {(feedbacks || []).filter(f => f && !f.response).length}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-purple-800">Average Rating</h4>
            <p className="text-2xl font-semibold text-purple-600 mt-1">
              {(feedbacks || []).length > 0 
                ? ((feedbacks || []).reduce((sum, f) => sum + (f && f.rating ? f.rating : 0), 0) / (feedbacks || []).length).toFixed(1)
                : 'N/A'}
            </p>
          </div>
        </div>
        
        {/* Priority Distribution */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-800 mb-3">Priority Distribution</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {priorities.map((p) => {
              const count = (feedbacks || []).filter(f => f && f.priority === p.value).length;
              const percentage = (feedbacks || []).length > 0 ? ((count / (feedbacks || []).length) * 100).toFixed(1) : 0;
              return (
                <div key={p.value} className={`p-3 rounded-md ${
                  p.value === 'urgent' ? 'bg-red-50' :
                  p.value === 'high' ? 'bg-orange-50' :
                  p.value === 'medium' ? 'bg-blue-50' :
                  'bg-gray-50'
                }`}>
                  <h5 className={`text-xs font-medium ${
                    p.value === 'urgent' ? 'text-red-800' :
                    p.value === 'high' ? 'text-orange-800' :
                    p.value === 'medium' ? 'text-blue-800' :
                    'text-gray-800'
                  }`}>{p.label}</h5>
                  <p className={`text-lg font-semibold mt-1 ${
                    p.value === 'urgent' ? 'text-red-600' :
                    p.value === 'high' ? 'text-orange-600' :
                    p.value === 'medium' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>{count} ({percentage}%)</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageFeedback;