const Room = require('../models/Room');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * @desc    Get all rooms
 * @route   GET /api/rooms
 * @access  Private/Admin/Warden
 */
exports.getRooms = async (req, res, next) => {
  try {
    // Get query parameters for filtering
    const { specialPurpose, purpose, available, includeStudents } = req.query;
    
    // Build filter object
    const filter = {};
    if (specialPurpose !== undefined) filter.specialPurpose = specialPurpose === 'true';
    if (purpose) filter.purpose = purpose;
    
    // Get all rooms
    let query = Room.find(filter).sort('roomNumber');
    
    // Populate student data if requested (limit to 6 students)
    if (includeStudents === 'true') {
      query = query.populate({
        path: 'students',
        select: 'name email studentId year branch college phoneNumber',
        model: 'User',
        options: { limit: 6 }
      });
    }
    
    let rooms = await query;
    
    // Filter by availability if requested
    if (available !== undefined) {
      const isAvailable = available === 'true';
      rooms = rooms.filter(room => {
        // Special purpose rooms are never available for students
        if (room.specialPurpose) return !isAvailable;
        
        // Regular rooms are available if they have space
        return isAvailable ? room.currentOccupancy < room.capacity : room.currentOccupancy >= room.capacity;
      });
    }
    
    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single room
 * @route   GET /api/rooms/:id
 * @access  Private/Admin/Warden
 */
exports.getRoom = async (req, res, next) => {
  try {
    const { includeStudents } = req.query;
    
    let query = Room.findById(req.params.id);
    
    // Populate student data if requested (limit to 6 students)
    if (includeStudents === 'true') {
      query = query.populate({
        path: 'students',
        select: 'name email studentId year branch college phoneNumber',
        model: 'User',
        options: { limit: 6 }
      });
    }
    
    const room = await query;
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room not found with id of ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    next(error);
  }
};

// ... rest of the file remains the same ...
