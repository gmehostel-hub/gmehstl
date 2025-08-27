import React, { useState, useEffect } from 'react';
import simpleApi from '../../utils/simpleApi';
import { useNavigate } from 'react-router-dom';

const WardenFeedback = () => {
  const navigate = useNavigate();
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
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    rating: '',
    searchTerm: ''
  });

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
  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'responded', label: 'Responded' },
    { value: 'resolved', label: 'Resolved' }
  ];
  const ratings = [
    { value: '', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ];
  const priorities = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent Priority' }
  ];

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await simpleApi.get('/api/feedback');
      if (response && response.data && response.data.success) {
        setFeedbacks(response.data.data || []);
      } else {
        setFeedbacks([]);
      }
    } catch (err) {
      setError('Failed to load feedbacks. Please try again later.');
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  };
  const handleSelectFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.response || '');
    setIsResolved(feedback.isResolved || false);
    setPriority(feedback.priority || 'medium');
    setResponseError(null);
    setResponseSuccess(null);
    setShowModal(true);
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
      const response = await simpleApi.post(`/api/feedback/${selectedFeedback._id}/respond`, {
        response: responseText,
        isResolved: isResolved,
        priority: priority
      });
      const updatedFeedback = response.data.data || response.data;
      setResponseSuccess(response.data.message || 'Response submitted successfully');
      setFeedbacks(prev => prev.map(fb => fb._id === selectedFeedback._id ? updatedFeedback : fb));
      setSelectedFeedback(updatedFeedback);
      setResponseText(updatedFeedback.response || '');
      setIsResolved(updatedFeedback.isResolved || false);
      setPriority(updatedFeedback.priority || 'medium');
    } catch (err) {
      setResponseError(err.response?.data?.message || err.message || 'Failed to submit response. Please try again.');
    } finally {
      setResponseLoading(false);
    }
  };
  const handleQuickResolve = async (feedbackId, resolveStatus) => {
    try {
      const response = await simpleApi.patch(`/api/feedback/${feedbackId}/resolve`, { isResolved: resolveStatus });
      const updatedFeedback = response.data.data;
      setFeedbacks(prev => prev.map(fb => fb._id === feedbackId ? updatedFeedback : fb));
      if (selectedFeedback && selectedFeedback._id === feedbackId) {
        setSelectedFeedback(updatedFeedback);
        setIsResolved(updatedFeedback.isResolved);
      }
    } catch (err) {
      setResponseError(err.response?.data?.message || 'Failed to update resolution status.');
    }
  };
  const getCategoryLabel = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  const filteredFeedbacks = (Array.isArray(feedbacks) ? feedbacks : []).filter(feedback => {
    if (filters.category && feedback.category !== filters.category) return false;
    if (filters.status) {
      let feedbackStatus;
      if (feedback.isResolved) feedbackStatus = 'resolved';
      else if (feedback.response) feedbackStatus = 'responded';
      else feedbackStatus = 'pending';
      if (feedbackStatus !== filters.status) return false;
    }
    if (filters.rating && feedback.rating.toString() !== filters.rating) return false;
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const studentName = feedback.student?.name?.toLowerCase() || '';
      const comment = feedback.comment?.toLowerCase() || '';
      const category = getCategoryLabel(feedback.category).toLowerCase();
      if (!studentName.includes(searchTerm) && !comment.includes(searchTerm) && !category.includes(searchTerm)) return false;
    }
    return true;
  });

  if (loading && (!Array.isArray(feedbacks) || feedbacks.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading feedbacks...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Manage Feedback</h1>
            <p className="text-gray-600">Review and respond to student feedback</p>
          </div>
          <button
            onClick={fetchFeedbacks}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Refresh Feedback
          </button>
      </div>
      {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchFeedbacks}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Try Again
            </button>
          </div>
        )}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select
                id="rating"
                name="rating"
                value={filters.rating}
                onChange={handleFilterChange}
                className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {ratings.map(rating => (
                  <option key={rating.value} value={rating.value}>{rating.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                id="search"
                placeholder="Search by comment or student"
                value={filters.searchTerm}
                onChange={handleSearchChange}
                className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading feedback...</p>
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-gray-500">No feedback found matching your filters.</p>
              <button
                onClick={() => setFilters({category: '', status: '', rating: '', searchTerm: ''})}
                className="mt-3 px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
              <ul className="divide-y divide-gray-200">
                {filteredFeedbacks.map((feedback) => (
                  <li 
                    key={feedback._id} 
                    className="p-4 hover:bg-gray-50 cursor-pointer"
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
                          {feedback.response && !feedback.isResolved && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Responded
                            </span>
                          )}
                          {feedback.isResolved && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Resolved
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
            </div>
          )}
        </div>
      </div>
      {showModal && selectedFeedback && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 md:mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-blue-600 text-white">
              <h2 className="text-xl font-semibold">
                Feedback Details
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
            <div className="p-6 max-h-[80vh] overflow-y-auto">
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
              <div className="mb-6 border-b pb-6">
                <h4 className="text-sm font-medium text-gray-500">Feedback</h4>
                <p className="text-base mt-1 whitespace-pre-wrap">{selectedFeedback.comment}</p>
              </div>
              <h4 className="text-lg font-medium text-gray-800 mb-4">Response</h4>
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
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Current Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedFeedback.isResolved 
                      ? 'bg-green-100 text-green-800' 
                      : selectedFeedback.response 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedFeedback.isResolved ? (
                      <>
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                        Resolved
                      </>
                    ) : selectedFeedback.response ? (
                      <>
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                        </svg>
                        Under Review
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
                        </svg>
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
              <form onSubmit={handleSubmitResponse}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Message
                  </label>
                  <textarea
                    value={responseText}
                    onChange={handleResponseChange}
                    rows="4"
                    placeholder="Type your response here..."
                    className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Set Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {priorities.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isResolved"
                      checked={isResolved}
                      onChange={(e) => setIsResolved(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isResolved" className="ml-2 block text-sm text-gray-900">
                      Mark as resolved
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Check this box if the issue has been fully addressed and resolved
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => handleQuickResolve(selectedFeedback._id, !selectedFeedback.isResolved)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium ${
                      selectedFeedback.isResolved
                        ? 'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                        : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    {selectedFeedback.isResolved ? 'Unresolve' : 'Quick Resolve'}
                  </button>
                  <button
                    type="submit"
                    disabled={responseLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {responseLoading ? 'Submitting...' : 'Submit Response'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WardenFeedback;
