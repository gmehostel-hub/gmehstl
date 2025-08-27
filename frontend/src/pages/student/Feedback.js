import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    category: 'hostel',
    rating: 3,
    comment: '',
    anonymous: false
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Categories for feedback
  const categories = [
    { value: 'hostel', label: 'Hostel Facilities' },
    { value: 'food', label: 'Food & Canteen' },
    { value: 'cleanliness', label: 'Cleanliness' },
    { value: 'staff', label: 'Staff Behavior' },
    { value: 'internet', label: 'Internet Connectivity' },
    { value: 'security', label: 'Security' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/feedbacks/my-feedbacks');
      setFeedbacks(response.data);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError('Failed to load feedbacks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);

    try {
      await api.post('/api/feedbacks', formData);
      setFormSuccess('Feedback submitted successfully');
      
      // Reset form
      setFormData({
        category: 'hostel',
        rating: 3,
        comment: '',
        anonymous: false
      });
      
      // Fetch updated feedbacks
      fetchFeedbacks();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setFormError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setFormLoading(false);
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
        <h2 className="text-2xl font-semibold text-gray-800">Feedback</h2>
        <p className="text-gray-600">Share your thoughts and suggestions to help us improve</p>
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

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Feedback Form */}
        <div className="lg:w-1/2 bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 bg-primary-600 text-white">
            <h3 className="text-lg font-medium">Submit New Feedback</h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(star)}
                        className="text-2xl focus:outline-none"
                      >
                        {star <= formData.rating ? (
                          <span className="text-yellow-400">★</span>
                        ) : (
                          <span className="text-gray-300">★</span>
                        )}
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-500">
                      {formData.rating === 1 && 'Poor'}
                      {formData.rating === 2 && 'Fair'}
                      {formData.rating === 3 && 'Good'}
                      {formData.rating === 4 && 'Very Good'}
                      {formData.rating === 5 && 'Excellent'}
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comments</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    required
                    rows="4"
                    placeholder="Please share your thoughts, suggestions, or concerns..."
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  ></textarea>
                </div>

                <div className="flex items-center">
                  <input
                    id="anonymous"
                    name="anonymous"
                    type="checkbox"
                    checked={formData.anonymous}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                    Submit anonymously
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed"
                  >
                    {formLoading ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Previous Feedbacks */}
        <div className="lg:w-1/2 bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">Your Previous Feedbacks</h3>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
            {feedbacks.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {feedbacks.map((feedback) => (
                  <li key={feedback._id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{getCategoryLabel(feedback.category)}</h4>
                        <p className="text-xs text-gray-500">{formatDate(feedback.createdAt)}</p>
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
                    <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{feedback.comment}</p>
                    
                    {/* Resolution Status */}
                    <div className="mt-3 flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        feedback.isResolved 
                          ? 'bg-green-100 text-green-800' 
                          : feedback.response 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {feedback.isResolved ? (
                          <>
                            <i className="fas fa-check-circle mr-1"></i>
                            Resolved
                          </>
                        ) : feedback.response ? (
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
                      
                      {feedback.priority && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          feedback.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          feedback.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          feedback.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {feedback.priority.charAt(0).toUpperCase() + feedback.priority.slice(1)} Priority
                        </span>
                      )}
                    </div>
                    
                    {feedback.response && (
                      <div className={`mt-3 p-3 rounded-md ${
                        feedback.isResolved ? 'bg-green-50' : 'bg-blue-50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-xs font-medium ${
                            feedback.isResolved ? 'text-green-800' : 'text-blue-800'
                          }`}>
                            Response from {feedback.respondedBy?.role === 'admin' ? 'Admin' : 'Warden'}:
                          </p>
                          {feedback.respondedAt && (
                            <p className="text-xs text-gray-500">
                              {formatDate(feedback.respondedAt)}
                            </p>
                          )}
                        </div>
                        <p className={`text-sm ${
                          feedback.isResolved ? 'text-green-700' : 'text-blue-700'
                        }`}>{feedback.response}</p>
                        
                        {feedback.isResolved && feedback.resolvedAt && (
                          <p className="text-xs text-green-600 mt-2">
                            <i className="fas fa-check mr-1"></i>
                            Resolved on {formatDate(feedback.resolvedAt)} by {feedback.resolvedBy?.role === 'admin' ? 'Admin' : 'Warden'}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {feedback.anonymous && (
                      <p className="mt-2 text-xs text-gray-400 italic">
                        <i className="fas fa-user-secret mr-1"></i>
                        Submitted anonymously
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>You haven't submitted any feedback yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Guidelines */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Feedback Guidelines</h3>
        <div className="bg-yellow-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-lightbulb text-yellow-500"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Tips for Effective Feedback</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Be specific and provide details about your experience</li>
                  <li>Focus on both positive aspects and areas for improvement</li>
                  <li>Suggest solutions when highlighting problems</li>
                  <li>Be respectful and constructive in your comments</li>
                  <li>Your feedback helps us improve the hostel experience for everyone</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;