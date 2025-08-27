const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  branch: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: 2030,
    validate: {
      validator: function(v) {
        return v >= 2020 && v <= 2030;
      },
      message: 'Placement year must be between 2020 and 2030'
    }
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  jobRole: {
    type: String,
    required: true,
    trim: true
  },
  packageOffered: {
    type: Number,
    required: true,
    min: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'placement_records'
});

// Update the updatedAt field before saving
placementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure no conflicting indexes
placementSchema.index({ studentName: 1, year: 1 }, { unique: false });

const Placement = mongoose.model('Placement', placementSchema);

module.exports = Placement;