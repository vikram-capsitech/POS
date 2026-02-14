const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/base/User');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const seedSuperAdmin = async () => {
  try {
    // Delete any existing superadmin to avoid duplicates
    await User.deleteMany({ role: 'superadmin' });
    
    console.log('Creating superadmin user...');
    
    const user = new User({
      name: "Super Admin",
      email: "SuperAdmin@jumbo.com",
      password: 'SuperAdmin@jumbo',  // Let the pre-save hook handle hashing
      role: "superadmin",
    });
    
    await user.save();

    console.log('\n🎉 SuperAdmin created successfully!');
    console.log('----------------------------------');
    console.log('Email: SuperAdmin@jumbo.com');
    console.log('Password: SuperAdmin@jumbo');
    console.log('----------------------------------');
    console.log('Use these credentials to log in at: http://localhost:5000/api/auth/login');
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating superadmin:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    mongoose.connection.close();
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

seedSuperAdmin();
