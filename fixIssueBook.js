const fs = require('fs');
const path = require('path');

// Read the current book controller
const controllerPath = path.join(__dirname, 'backend', 'controllers', 'bookController.js');
let controllerContent = fs.readFileSync(controllerPath, 'utf8');

// Fix the student lookup in issueBook function
const oldStudentLookup = `const student = await User.findOne({ studentId: req.params.studentId, role: 'student' });`;
const newStudentLookup = `const student = await User.findById(req.params.studentId);`;

const oldStudentCheck = `if (!student) {`;
const newStudentCheck = `if (!student || student.role !== 'student') {`;

// Replace the problematic lines
controllerContent = controllerContent.replace(oldStudentLookup, newStudentLookup);
controllerContent = controllerContent.replace(oldStudentCheck, newStudentCheck);

// Write the fixed content back
fs.writeFileSync(controllerPath, controllerContent);

console.log('✅ Fixed issueBook controller to use student _id instead of non-existent studentId field');
console.log('📝 Updated student lookup to use User.findById()');
console.log('🔍 Added role validation to ensure user is a student');
