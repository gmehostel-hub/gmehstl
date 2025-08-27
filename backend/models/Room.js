const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 31
  },
  capacity: {
    type: Number,
    default: 6,
    min: 0,
    max: 6
  },
  
  specialPurpose: {
    type: Boolean,
    default: false
  },
  purpose: {
    type: String,
    enum: ['Regular', 'Cooking Staff Room', 'Digital Lab 1', 'Book Library', 'Warden Office', 'Store Room', 'Digital Lab 2'],
    default: 'Regular'
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to set special purpose flag and purpose based on room number
roomSchema.pre('save', function(next) {
  // Set special purpose and purpose based on room number
  switch(this.roomNumber) {
    case 1:
      this.specialPurpose = true;
      this.purpose = 'Cooking Staff Room';
      break;
    case 8:
      this.specialPurpose = true;
      this.purpose = 'Digital Lab 1';
      break;
    case 15:
      this.specialPurpose = true;
      this.purpose = 'Book Library';
      break;
    case 16:
      this.specialPurpose = true;
      this.purpose = 'Warden Office';
      break;
    case 17:
      this.specialPurpose = true;
      this.purpose = 'Store Room';
      break;
    case 31:
      this.specialPurpose = true;
      this.purpose = 'Digital Lab 2';
      break;
    default:
      this.specialPurpose = false;
      this.purpose = 'Regular';
  }
  next();
});

// Method to check if room is available for new students
roomSchema.virtual('currentOccupancy').get(function() {
  return this.students.length;
});

// Method to check if room is available for new students
roomSchema.methods.isAvailable = function() {
  // Special purpose rooms are not available for student allocation
  if (this.specialPurpose) return false;
  
  // Check if room has available capacity
  return this.students.length < this.capacity;
};

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;