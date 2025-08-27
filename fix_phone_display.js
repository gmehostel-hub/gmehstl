const fs = require('fs');
const path = require('path');

// Path to the room controller file
const roomControllerPath = path.join(__dirname, 'backend', 'controllers', 'roomController.js');

// Read the current content of the file
let content = fs.readFileSync(roomControllerPath, 'utf8');

// Update the select fields to include phoneNumber
content = content.replace(
  /select: 'name email studentId year branch college'/g,
  "select: 'name email studentId year branch college phoneNumber'"
);

// Write the updated content back to the file
fs.writeFileSync(roomControllerPath, content, 'utf8');

console.log('Room controller updated successfully!');
