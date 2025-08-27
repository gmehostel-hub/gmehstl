import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const FeedbackStatistics = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Priorities for statistics display
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
      const response = await api.get('/api/feedback');
      setFeedbacks(response.data);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError('Failed to load feedback statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
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
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchFeedbacks}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feedback Statistics</h1>
            <p className="mt-1 text-sm text-gray-600">
              Overview of student feedback and satisfaction metrics
            </p>
          </div>
          <button
            onClick={fetchFeedbacks}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Main Statistics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Overall Statistics</h3>
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
      </div>

      {/* Category Breakdown */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Feedback by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['hostel', 'food', 'cleanliness', 'staff', 'internet', 'security', 'other'].map((category) => {
            const count = (feedbacks || []).filter(f => f && f.category === category).length;
            const percentage = (feedbacks || []).length > 0 ? ((count / (feedbacks || []).length) * 100).toFixed(1) : 0;
            const categoryLabels = {
              hostel: 'Hostel Facilities',
              food: 'Food & Canteen',
              cleanliness: 'Cleanliness',
              staff: 'Staff Behavior',
              internet: 'Internet',
              security: 'Security',
              other: 'Other'
            };
            
            return (
              <div key={category} className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-800">{categoryLabels[category]}</h4>
                <p className="text-xl font-semibold text-gray-600 mt-1">{count}</p>
                <p className="text-xs text-gray-500">{percentage}% of total</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Priority Distribution</h3>
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

      {/* Rating Distribution */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Rating Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = (feedbacks || []).filter(f => f && f.rating === rating).length;
            const percentage = (feedbacks || []).length > 0 ? ((count / (feedbacks || []).length) * 100).toFixed(1) : 0;
            return (
              <div key={rating} className="bg-yellow-50 p-3 rounded-md">
                <h5 className="text-xs font-medium text-yellow-800">
                  {rating} Star{rating !== 1 ? 's' : ''}
                </h5>
                <p className="text-lg font-semibold text-yellow-600 mt-1">{count}</p>
                <p className="text-xs text-yellow-500">{percentage}% of total</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-indigo-800">This Week</h4>
            <p className="text-xl font-semibold text-indigo-600 mt-1">
              {(feedbacks || []).filter(f => {
                if (!f || !f.createdAt) return false;
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(f.createdAt) >= weekAgo;
              }).length}
            </p>
            <p className="text-xs text-indigo-500">New feedbacks</p>
          </div>
          
          <div className="bg-teal-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-teal-800">This Month</h4>
            <p className="text-xl font-semibold text-teal-600 mt-1">
              {(feedbacks || []).filter(f => {
                if (!f || !f.createdAt) return false;
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return new Date(f.createdAt) >= monthAgo;
              }).length}
            </p>
            <p className="text-xs text-teal-500">New feedbacks</p>
          </div>
          
          <div className="bg-pink-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-pink-800">Response Rate</h4>
            <p className="text-xl font-semibold text-pink-600 mt-1">
              {(feedbacks || []).length > 0 
                ? (((feedbacks || []).filter(f => f && f.response).length / (feedbacks || []).length) * 100).toFixed(1)
                : 0}%
            </p>
            <p className="text-xs text-pink-500">Feedbacks responded</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackStatistics;
