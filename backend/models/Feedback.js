const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['hostel', 'food', 'cleanliness', 'staff', 'internet', 'security', 'other'],
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  response: {
    type: String,
    trim: true
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, { timestamps: true });

// Virtual for status
feedbackSchema.virtual('status').get(function() {
  return this.response ? 'responded' : 'pending';
});

// Method to hide student information if feedback is anonymous
feedbackSchema.methods.toJSON = function() {
  const feedbackObject = this.toObject({ virtuals: true });
  
  // If feedback is anonymous, remove student information
  if (feedbackObject.anonymous) {
    // Keep the student ID for backend reference but remove details when sending to frontend
    if (typeof feedbackObject.student === 'object' && feedbackObject.student !== null) {
      feedbackObject.student = {
        _id: feedbackObject.student._id
      };
    }
  }
  
  return feedbackObject;
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;