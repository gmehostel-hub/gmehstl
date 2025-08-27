const Placement = require('../models/Placement');
const User = require('../models/User');

/**
 * @desc    Get all placements
 * @route   GET /api/placements
 * @access  Private/Admin
 */
exports.getPlacements = async (req, res, next) => {
  try {
    // Get query parameters for filtering
    const { status, companyName } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (companyName) filter.companyName = { $regex: companyName, $options: 'i' };
    
    // Get all placements
    const placements = await Placement.find(filter)
      .sort('-updatedAt');
    
    res.status(200).json({
      success: true,
      count: placements.length,
      data: placements
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single placement
 * @route   GET /api/placements/:id
 * @access  Private/Admin
 */
exports.getPlacement = async (req, res, next) => {
  try {
    const placement = await Placement.findById(req.params.id);
    
    if (!placement) {
      return res.status(404).json({
        success: false,
        message: `Placement not found with id of ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: placement
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get placement by student ID
 * @route   GET /api/placements/student/:studentId
 * @access  Private
 */
exports.getPlacementByStudentId = async (req, res, next) => {
  try {
    // Find student
    const student = await User.findOne({ studentId: req.params.studentId, role: 'student' });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with ID ${req.params.studentId}`
      });
    }
    
    // Check if user has permission to view this placement
    if (req.user.role === 'student' && student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this placement information'
      });
    }
    
    // Get placement
    const placement = await Placement.findOne({ student: student._id })
      .populate('student', 'name studentId email year branch college');
    
    if (!placement) {
      return res.status(404).json({
        success: false,
        message: `Placement record not found for student ${student.name}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: placement
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create placement
 * @route   POST /api/placements
 * @access  Private/Admin
 */
exports.createPlacement = async (req, res, next) => {
  try {
    // Create placement directly with student name
    const placement = await Placement.create(req.body);
    
    res.status(201).json({
      success: true,
      data: placement
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update placement
 * @route   PUT /api/placements/:id
 * @access  Private/Admin
 */
exports.updatePlacement = async (req, res, next) => {
  try {
    let placement = await Placement.findById(req.params.id);
    
    if (!placement) {
      return res.status(404).json({
        success: false,
        message: `Placement not found with id of ${req.params.id}`
      });
    }
    
    // Don't allow changing student name once placement is created
    if (req.body.studentName && req.body.studentName !== placement.studentName) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change student name for an existing placement record'
      });
    }
    
    // Update placement
    placement = await Placement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: placement
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete placement
 * @route   DELETE /api/placements/:id
 * @access  Private/Admin
 */
exports.deletePlacement = async (req, res, next) => {
  try {
    const placement = await Placement.findById(req.params.id);
    
    if (!placement) {
      return res.status(404).json({
        success: false,
        message: `Placement not found with id of ${req.params.id}`
      });
    }
    
    await Placement.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get placement statistics
 * @route   GET /api/placements/stats
 * @access  Private/Admin
 */
exports.getPlacementStats = async (req, res, next) => {
  try {
    // Get total placements count
    const totalPlacements = await Placement.countDocuments();
    
    // Get average package
    const avgPackageResult = await Placement.aggregate([
      { $group: { _id: null, avgPackage: { $avg: '$packageOffered' } } }
    ]);
    
    const avgPackage = avgPackageResult.length > 0 ? avgPackageResult[0].avgPackage : 0;
    
    // Get top companies by placement count
    const topCompanies = await Placement.aggregate([
      { $group: { _id: '$companyName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Get highest package
    const highestPackageResult = await Placement.findOne()
      .sort('-packageOffered');
    
    const highestPackage = highestPackageResult ? {
      amount: highestPackageResult.packageOffered,
      student: highestPackageResult.studentName || 'Unknown',
      company: highestPackageResult.companyName
    } : null;
    
    // Get placements by year
    const placementsByYear = await Placement.aggregate([
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Get placements by branch
    const placementsByBranch = await Placement.aggregate([
      { $group: { _id: '$branch', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalPlacements,
        avgPackage,
        highestPackage,
        topCompanies: topCompanies.map(company => ({
          name: company._id,
          count: company.count
        })),
        placementsByYear: placementsByYear.map(item => ({
          year: item._id,
          count: item.count
        })),
        placementsByBranch: placementsByBranch.map(item => ({
          branch: item._id,
          count: item.count
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my placement (for students)
 * @route   GET /api/placements/me
 * @access  Private/Student
 */
exports.getMyPlacement = async (req, res, next) => {
  try {
    // Ensure user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Route only accessible to students'
      });
    }
    
    // Get placement
    const placement = await Placement.findOne({ student: req.user._id });
    
    if (!placement) {
      return res.status(404).json({
        success: false,
        message: 'Placement record not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: placement
    });
  } catch (error) {
    next(error);
  }
};