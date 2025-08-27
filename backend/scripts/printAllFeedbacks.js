const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hostel';

async function printAllFeedbacks() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const feedbacks = await Feedback.find().sort({ createdAt: -1 });
  if (!feedbacks.length) {
    console.log('No feedbacks found.');
  } else {
    feedbacks.forEach(fb => {
      console.log('---');
      console.log('ID:', fb._id);
      console.log('Category:', fb.category);
      console.log('Status:', fb.status);
      console.log('Title:', fb.title);
      console.log('Description:', fb.description);
      console.log('Created At:', fb.createdAt);
    });
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

printAllFeedbacks().catch(err => {
  console.error('Error:', err);
  mongoose.disconnect();
});