// Test script to debug room filtering issue
console.log('Testing room filtering logic...');

// Mock data similar to what might be in the database
const mockStudents = [
  { name: 'Priya Sharma', roomNumber: 5, email: 'priya@student.com' },
  { name: 'human', roomNumber: 8, email: 'human@gmail.com' },
  { name: 'king', roomNumber: 12, email: 'king@gmail.com' },
  { name: 'raju', roomNumber: 15, email: 'raju@gmail.com' },
  { name: 'John Doe', roomNumber: 10, email: 'john@student.com' },
  { name: 'Jane Smith', roomNumber: 10, email: 'jane@student.com' }
];

const selectedRoom = { roomNumber: 10 };

console.log('Selected Room:', selectedRoom.roomNumber);
console.log('All Students:', mockStudents.map(s => ({
  name: s.name,
  roomNumber: s.roomNumber
})));

// Test the filtering logic
const roomStudents = mockStudents.filter(student => {
  const isAssigned = student.roomNumber === selectedRoom.roomNumber;
  console.log(`Student ${student.name}: roomNumber=${student.roomNumber}, selectedRoom=${selectedRoom.roomNumber}, isAssigned=${isAssigned}`);
  return isAssigned;
});

console.log('Filtered Room Students:', roomStudents.map(s => s.name));
console.log('Expected: Only John Doe and Jane Smith should be shown for Room 10');
console.log('Actual result:', roomStudents.length === 2 && roomStudents.every(s => s.roomNumber === 10) ? 'CORRECT' : 'INCORRECT');
