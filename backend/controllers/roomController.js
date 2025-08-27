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
 * @desc    Remove all students from all rooms
 * @route   DELETE /api/rooms/remove-all-students
 * @access  Private/Admin
 */
exports.removeAllStudentsFromRooms = async (req, res, next) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get all rooms with students
      const rooms = await Room.find({ currentOccupancy: { $gt: 0 } });
      
      if (rooms.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No rooms have students assigned'
        });
      }

      // Update all students to have no room
      await User.updateMany(
        { role: 'student', roomNumber: { $exists: true, $ne: null } },
        { roomNumber: null },
        { session }
      );

      // Update all rooms to have no students and zero occupancy
      await Room.updateMany(
        {},
        { students: [], currentOccupancy: 0 },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: `All students removed from all rooms successfully`,
        roomsAffected: rooms.length
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
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

/**
 * @desc    Get room by room number
 * @route   GET /api/rooms/number/:roomNumber
 * @access  Private/Admin/Warden
 */
exports.getRoomByNumber = async (req, res, next) => {
  try {
    const room = await Room.findOne({ roomNumber: req.params.roomNumber });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room not found with number ${req.params.roomNumber}`
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

/**
 * @desc    Get students in a room
 * @route   GET /api/rooms/number/:roomNumber/students
 * @access  Private/Admin/Warden
 */
exports.getRoomStudents = async (req, res, next) => {
  try {
    const room = await Room.findOne({ roomNumber: req.params.roomNumber });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room not found with number ${req.params.roomNumber}`
      });
    }
    
    // Get students in the room (limit to 6)
    const students = await User.find({
      _id: { $in: room.students },
      role: 'student'
    }).select('studentId name year branch college').limit(6);
    
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update room
 * @route   PUT /api/rooms/:id
 * @access  Private/Admin
 */
exports.updateRoom = async (req, res, next) => {
  try {
    // Find room
    let room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room not found with id of ${req.params.id}`
      });
    }
    
    // Don't allow changing room number or special purpose status
    if (req.body.roomNumber && req.body.roomNumber !== room.roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'Room number cannot be changed'
      });
    }
    
    if (req.body.specialPurpose !== undefined && req.body.specialPurpose !== room.specialPurpose) {
      return res.status(400).json({
        success: false,
        message: 'Special purpose status cannot be changed'
      });
    }
    
    // Update room
    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign student to room
 * @route   POST /api/rooms/number/:roomNumber/assign/:studentId
 * @access  Private/Admin
 */
exports.assignStudentToRoom = async (req, res, next) => {
  try {
    // Find room
    const room = await Room.findOne({ roomNumber: req.params.roomNumber });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room not found with number ${req.params.roomNumber}`
      });
    }
    
    // Check if room is special purpose
    if (room.specialPurpose) {
      return res.status(400).json({
        success: false,
        message: `Room ${req.params.roomNumber} is a special purpose room and cannot be assigned to students`
      });
    }
    
    // Check if room has capacity
    if (!room.isAvailable()) {
      return res.status(400).json({
        success: false,
        message: `Room ${req.params.roomNumber} is at full capacity`
      });
    }
    
    // Find student
    const student = await User.findOne({ studentId: req.params.studentId, role: 'student' });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with ID ${req.params.studentId}`
      });
    }
    
    // Check if student is already assigned to a room
    if (student.roomNumber) {
      // Remove from old room
      await Room.findOneAndUpdate(
        { roomNumber: student.roomNumber },
        { $pull: { students: student._id } }
      );
    }
    
    // Update student's room assignment
    await User.findByIdAndUpdate(student._id, { roomNumber: room.roomNumber });
    
    // Add student to room
    await Room.findByIdAndUpdate(
      room._id,
      { $push: { students: student._id } }
    );
    
    res.status(200).json({
      success: true,
      message: `Student ${student.name} assigned to Room ${room.roomNumber}`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove student from room
 * @route   DELETE /api/rooms/number/:roomNumber/remove/:studentId
 * @access  Private/Admin
 */
exports.removeStudentFromRoom = async (req, res, next) => {
  try {
    // Find room
    const room = await Room.findOne({ roomNumber: req.params.roomNumber });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room not found with number ${req.params.roomNumber}`
      });
    }
    
    // Find student
    const student = await User.findOne({ studentId: req.params.studentId, role: 'student' });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with ID ${req.params.studentId}`
      });
    }
    
    // Check if student is assigned to this room
    if (student.roomNumber !== room.roomNumber) {
      return res.status(400).json({
        success: false,
        message: `Student ${student.name} is not assigned to Room ${room.roomNumber}`
      });
    }
    
    // Update student's room assignment
    await User.findByIdAndUpdate(student._id, { roomNumber: null });
    
    // Remove student from room
    await Room.findByIdAndUpdate(
      room._id,
      { $pull: { students: student._id } }
    );
    
    res.status(200).json({
      success: true,
      message: `Student ${student.name} removed from Room ${room.roomNumber}`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new room
 * @route   POST /api/rooms
 * @access  Private/Admin
 */
exports.createRoom = async (req, res, next) => {
  try {
    const { roomNumber, capacity, specialPurpose, purpose } = req.body;

    // Check if room with this number already exists
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Room with number ${roomNumber} already exists`
      });
    }

    // Create room
    const room = await Room.create({
      roomNumber,
      capacity,
      specialPurpose: specialPurpose || false,
      purpose: purpose || 'Regular',
      currentOccupancy: 0,
      students: []
    });

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a room
 * @route   DELETE /api/rooms/:id
 * @access  Private/Admin
 */
exports.deleteRoom = async (req, res, next) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find room
      const room = await Room.findById(req.params.id);
      
      if (!room) {
        return res.status(404).json({
          success: false,
          message: `Room not found with id of ${req.params.id}`
        });
      }

      // Update all students in this room to have no room
      if (room.students && room.students.length > 0) {
        await User.updateMany(
          { _id: { $in: room.students } },
          { roomNumber: null },
          { session }
        );
      }

      // Delete the room
      await Room.findByIdAndDelete(req.params.id, { session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: `Room ${room.roomNumber} deleted successfully`
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current student's room
 * @route   GET /api/rooms/my-room
 * @access  Private/Student
 */
exports.getMyRoom = async (req, res, next) => {
  try {
    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can access this resource'
      });
    }

    // Check if student has a room assigned
    if (!req.user.roomNumber) {
      return res.status(404).json({
        success: false,
        message: 'You do not have a room assigned'
      });
    }

    // Get room details
    const room = await Room.findOne({ roomNumber: req.user.roomNumber });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room not found with number ${req.user.roomNumber}`
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

/**
 * @desc    Get current student's roommates
 * @route   GET /api/rooms/my-roommates
 * @access  Private/Student
 */
exports.getMyRoommates = async (req, res, next) => {
  try {
    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can access this resource'
      });
    }

    // Check if student has a room assigned
    if (!req.user.roomNumber) {
      return res.status(404).json({
        success: false,
        message: 'You do not have a room assigned'
      });
    }

    // Find the room
    const room = await Room.findOne({ roomNumber: req.user.roomNumber });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room not found with number ${req.user.roomNumber}`
      });
    }
    
    // Get roommates (excluding the current user)
    const roommates = await User.find({
      _id: { $in: room.students, $ne: req.user._id },
      role: 'student'
    }).select('studentId name email phoneNumber year branch college');
    
    res.status(200).json({
      success: true,
      count: roommates.length,
      data: roommates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clean orphaned student references from all rooms
 * @route   PUT /api/rooms/clean-orphans
 * @access  Private/Admin
 */
exports.cleanOrphanedStudents = async (req, res, next) => {
  try {
    const rooms = await Room.find({ "students.0": { $exists: true } });
    let cleanedCount = 0;
    let orphansRemovedCount = 0;

    for (const room of rooms) {
      // Filter for valid ObjectIds before querying to prevent cast errors
      const validStudentIdsForQuery = room.students.filter(id => mongoose.Types.ObjectId.isValid(id));
      
      const existingStudentIds = await User.find({ '_id': { $in: validStudentIdsForQuery } }).select('_id');
      const existingIdsSet = new Set(existingStudentIds.map(s => s._id.toString()));

      // Now, filter the original array to keep only valid and existing students
      const originalCount = room.students.length;
      const validStudents = room.students.filter(studentId => 
        mongoose.Types.ObjectId.isValid(studentId) && existingIdsSet.has(studentId.toString())
      );

      if (validStudents.length < originalCount) {
        room.students = validStudents;
        await room.save();
        cleanedCount++;
        orphansRemovedCount += (originalCount - validStudents.length);
      }
    }

    res.status(200).json({
      success: true,
      message: `Database cleanup complete. Checked ${rooms.length} rooms, cleaned ${cleanedCount} of them, and removed ${orphansRemovedCount} orphaned student references.`,
    });
  } catch (error) {
    next(error);
  }
};