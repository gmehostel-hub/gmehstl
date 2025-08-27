const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hostel';

async function seedSampleFeedbacks() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const sampleFeedbacks = [
    {
      student: new mongoose.Types.ObjectId(),
      category: 'hostel',
      status: 'pending',
      title: 'Leaking tap in bathroom',
      description: 'The tap in the second floor bathroom is leaking continuously.',
      comment: 'The tap in the second floor bathroom is leaking continuously.',
      rating: 4,
      createdAt: new Date(),
    },
    {
      student: new mongoose.Types.ObjectId(),
      category: 'cleanliness',
      status: 'in-progress',
      title: 'Dirty corridors',
      description: 'The corridors are not being cleaned regularly.',
      comment: 'The corridors are not being cleaned regularly.',
      rating: 3,
      createdAt: new Date(),
    },
    {
      student: new mongoose.Types.ObjectId(),
      category: 'food',
      status: 'resolved',
      title: 'Food quality issue',
      description: 'The food served in the mess is often cold and tasteless.',
      comment: 'The food served in the mess is often cold and tasteless.',
      rating: 2,
      createdAt: new Date(),
    },
    {
      student: new mongoose.Types.ObjectId(),
      category: 'staff',
      status: 'pending',
      title: 'Rude staff member',
      description: 'One of the staff members was rude to students.',
      comment: 'One of the staff members was rude to students.',
      rating: 3,
      createdAt: new Date(),
    },
    {
      student: new mongoose.Types.ObjectId(),
      category: 'other',
      status: 'pending',
      title: 'WiFi not working',
      description: 'The hostel WiFi has not been working for two days.',
      comment: 'The hostel WiFi has not been working for two days.',
      rating: 5,
      createdAt: new Date(),
    },
  ];

  await Feedback.insertMany(sampleFeedbacks);
  console.log('Sample feedbacks inserted.');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

seedSampleFeedbacks().catch(err => {
  console.error('Error:', err);
  mongoose.disconnect();
});