const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms');
  const users = await User.find({}, 'name email role');
  console.log('--- USER LIST ---');
  console.log(JSON.stringify(users, null, 2));
  await mongoose.disconnect();
}

checkUsers();
