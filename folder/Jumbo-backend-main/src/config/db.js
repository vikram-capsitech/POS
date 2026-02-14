const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Enable colors if the package is installed
try {
  require('colors');
} catch (e) {
  // If colors package is not installed, add empty color methods to prevent errors
  String.prototype.cyan = String.prototype.blue = String.prototype.green = 
  String.prototype.yellow = String.prototype.red = String.prototype.underline = 
  String.prototype.bold = function() { return this; };
}

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('ℹ️  MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    // Don't exit the process in development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
