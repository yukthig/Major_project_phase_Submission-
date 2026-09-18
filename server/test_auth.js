const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

async function testAuth() {
  try {
    console.log('Connecting to MongoDB at:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected Successfully!');

    // Check existing users
    const usersCount = await User.countDocuments();
    console.log(`Total users in DB: ${usersCount}`);

    // Check or create admin user
    let admin = await User.findOne({ email: 'admin@neurovision.com' }).select('+password');
    if (!admin) {
      console.log('Admin user does not exist. Creating admin@neurovision.com...');
      admin = await User.create({
        name: 'Dr. Admin User',
        email: 'admin@neurovision.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user created successfully!');
      admin = await User.findOne({ email: 'admin@neurovision.com' }).select('+password');
    } else {
      console.log('Admin user found in database!');
    }

    // Test password comparison
    const isMatch = await admin.comparePassword('admin123');
    console.log('Password comparison test ("admin123"):', isMatch);

    // Test JWT token generation
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('JWT Token generation test:', token ? 'SUCCESS' : 'FAILED');

    // Test Physician user
    let physician = await User.findOne({ email: 'sarah@neurovision.com' }).select('+password');
    if (!physician) {
      console.log('Creating sarah@neurovision.com...');
      await User.create({
        name: 'Dr. Sarah Johnson',
        email: 'sarah@neurovision.com',
        password: 'user123',
        role: 'user'
      });
      console.log('Physician user created successfully!');
    }

    process.exit(0);
  } catch (err) {
    console.error('AUTH TEST ERROR:', err);
    process.exit(1);
  }
}

testAuth();
