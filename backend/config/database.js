const mongoose = require('mongoose');

// Use the specific MongoDB URI provided by the user
const MONGODB_URI = 'mongodb+srv://admin:admin123@cluster0.m2hbix6.mongodb.net/';

const connectDB = async () => {
  try {
    // Remove deprecated options and use modern connection string
    const conn = await mongoose.connect(MONGODB_URI, {
      // These options are no longer needed in modern mongoose versions
      // but can be added if needed for specific configurations
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    
    // Test the connection
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.on('disconnected', () => {
      console.log('❌ MongoDB disconnected');
    });
    db.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
    // Create a test collection to verify connection works (silent)
    try {
      await db.createCollection('connection_test');
      await db.collection('connection_test').drop();
    } catch (testError) {
      // Silent test
    }
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:');
    console.error('🔍 Error details:', error.message);
    
    // Common MongoDB error explanations
    if (error.message.includes('Authentication failed')) {
      console.log('💡 Possible fix: Check username/password in MongoDB URI');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('💡 Possible fix: Check network connection and MongoDB cluster name');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Possible fix: Check firewall and network settings');
    }
    
    // Don't exit the process, just log the error
    // This allows the app to continue running even if DB is down
    console.log('⚠️  Application will continue running without database connection');
    
    // Optional: You can uncomment this if you want the app to exit on DB connection failure
    // process.exit(1);
  }
};

module.exports = connectDB;
