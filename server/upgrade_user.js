const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function upgradeUser() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms');
  const user = await User.findOneAndUpdate(
    { email: 'darkeaglerules6ios@gmail.com' },
    { role: 'tutor' },
    { new: true }
  );
  console.log('--- USER UPGRADED ---');
  console.log(JSON.stringify(user, null, 2));
  await mongoose.disconnect();
}

upgradeUser();
