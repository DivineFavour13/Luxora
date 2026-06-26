require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Check if admin already exists
    const existing = await User.findOne({ email: 'admin@luxora.com' });
    if (existing) {
      // Update role to admin if not already
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log('✅ Updated existing user to admin role');
      } else {
        console.log('✅ Admin user already exists');
      }
      process.exit(0);
    }

    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@luxora.com',
      password: hashed,
      role: 'admin',
    });

    console.log('✅ Admin user created: admin@luxora.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
}

seedAdmin();