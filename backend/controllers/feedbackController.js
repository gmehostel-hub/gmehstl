const Feedback = require('../models/Feedback');
const User = require('../models/User');

// Create a new feedback
exports.createFeedback = async (req, res) => {
  try {
    const { category, rating, comment, anonymous } = req.body;
    
    // Validate required fields
    if (!category || !rating || !comment) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide category, rating, and comment' 
      });
    }
    
    // Create new feedback
    const feedback = new Feedback({
      student: req.user.id,
      category,
      rating,
      comment,
      anonymous: anonymous || false
    });
    
    await feedback.save();
    
    res.status(201).json({
      success: true,
      data: feedback,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Get all feedbacks (admin only)
exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate({
        path: 'student',
        select: 'name email registrationNumber roomNumber'
      })
      .populate({
        path: 'respondedBy',
        select: 'name email role'
      })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Get hostel-related feedbacks (warden only)
exports.getHostelFeedbacks = async (req, res) => {
  try {
    // Categories that wardens can access
    const wardenCategories = ['hostel', 'cleanliness', 'staff', 'security', 'other'];
    
    const feedbacks = await Feedback.find({ category: { $in: wardenCategories } })
      .populate({
        path: 'student',
        select: 'name email registrationNumber roomNumber'
      })
      .populate({
        path: 'respondedBy',
        select: 'name email role'
      })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    console.error('Error fetching hostel feedbacks:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Get feedbacks by student ID (for current user)
exports.getMyFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ student: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    console.error('Error fetching student feedbacks:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Get a specific feedback by ID
exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate({
        path: 'student',
        select: 'name email registrationNumber roomNumber'
      })
      .populate({
        path: 'respondedBy',
        select: 'name email role'
      });
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Check if user is authorized to view this feedback
    const isAdmin = req.user.role === 'admin';
    const isWarden = req.user.role === 'warden';
    const isOwner = feedback.student._id.toString() === req.user.id;
    
    // Wardens can only view hostel-related feedbacks
    const wardenCategories = ['hostel', 'cleanliness', 'staff', 'security', 'other'];
    const isWardenAccessible = isWarden && wardenCategories.includes(feedback.category);
    
    if (!isAdmin && !isOwner && !isWardenAccessible) {
      return res.status(403).json({ message: 'Not authorized to view this feedback' });
    }
    
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Respond to a feedback (admin and warden only)
exports.respondToFeedback = async (req, res) => {
  try {
    const { response, isResolved, priority } = req.body;
    
    if (!response) {
      return res.status(400).json({ message: 'Response text is required' });
    }
    
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Check if user is authorized to respond to this feedback
    const isAdmin = req.user.role === 'admin';
    const isWarden = req.user.role === 'warden';
    
    // Admin can respond to all feedback, warden can respond to all feedback too
    if (!isAdmin && !isWarden) {
      return res.status(403).json({ message: 'Not authorized to respond to this feedback' });
    }
    
    // Update feedback with response
    feedback.response = response;
    feedback.respondedBy = req.user.id;
    feedback.respondedAt = Date.now();
    
    // Handle resolution status
    if (isResolved !== undefined) {
      feedback.isResolved = isResolved;
      if (isResolved) {
        feedback.resolvedBy = req.user.id;
        feedback.resolvedAt = Date.now();
      }
    }
    
    // Update priority if provided
    if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
      feedback.priority = priority;
    }
    
    await feedback.save();
    
    // Populate the response with user details
    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate({
        path: 'student',
        select: 'name email studentId roomNumber'
      })
      .populate({
        path: 'respondedBy',
        select: 'name email role'
      })
      .populate({
        path: 'resolvedBy',
        select: 'name email role'
      });
    
    res.json({
      success: true,
      message: isResolved ? 'Feedback marked as resolved' : 'Response added to feedback',
      data: populatedFeedback
    });
  } catch (error) {
    console.error('Error responding to feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark feedback as resolved/unresolved (admin and warden only)
exports.markFeedbackResolved = async (req, res) => {
  try {
    const { isResolved } = req.body;
    
    if (isResolved === undefined) {
      return res.status(400).json({ message: 'Resolution status is required' });
    }
    
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Check if user is authorized to resolve this feedback
    const isAdmin = req.user.role === 'admin';
    const isWarden = req.user.role === 'warden';
    
    if (!isAdmin && !isWarden) {
      return res.status(403).json({ message: 'Not authorized to resolve this feedback' });
    }
    
    // Update resolution status
    feedback.isResolved = isResolved;
    if (isResolved) {
      feedback.resolvedBy = req.user.id;
      feedback.resolvedAt = Date.now();
    } else {
      feedback.resolvedBy = undefined;
      feedback.resolvedAt = undefined;
    }
    
    await feedback.save();
    
    // Populate the response with user details
    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate({
        path: 'student',
        select: 'name email studentId roomNumber'
      })
      .populate({
        path: 'respondedBy',
        select: 'name email role'
      })
      .populate({
        path: 'resolvedBy',
        select: 'name email role'
      });
    
    res.json({
      success: true,
      message: isResolved ? 'Feedback marked as resolved' : 'Feedback marked as unresolved',
      data: populatedFeedback
    });
  } catch (error) {
    console.error('Error updating feedback resolution status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a feedback (admin only)
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Only admin or the student who created the feedback can delete it
    const isAdmin = req.user.role === 'admin';
    const isOwner = feedback.student.toString() === req.user.id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this feedback' });
    }
    
    await Feedback.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get feedback statistics (admin only)
exports.getFeedbackStats = async (req, res) => {
  try {
    // Total count
    const totalCount = await Feedback.countDocuments();
    
    // Count by category
    const categoryStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Count by response status
    const responseStats = await Feedback.aggregate([
      {
        $group: {
          _id: { $cond: [{ $ifNull: ['$response', false] }, 'responded', 'pending'] },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Average rating
    const ratingStats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          ratingCounts: {
            $push: {
              rating: '$rating',
              count: 1
            }
          }
        }
      }
    ]);
    
    // Process rating distribution
    let ratingDistribution = [0, 0, 0, 0, 0]; // For ratings 1-5
    if (ratingStats.length > 0) {
      const allRatings = ratingStats[0].ratingCounts;
      allRatings.forEach(item => {
        const ratingIndex = Math.floor(item.rating) - 1;
        if (ratingIndex >= 0 && ratingIndex < 5) {
          ratingDistribution[ratingIndex] += item.count;
        }
      });
    }
    
    // Recent trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTrends = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    res.json({
      totalCount,
      categoryStats,
      responseStats,
      averageRating: ratingStats.length > 0 ? ratingStats[0].averageRating : 0,
      ratingDistribution,
      recentTrends
    });
  } catch (error) {
    console.error('Error fetching feedback statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};