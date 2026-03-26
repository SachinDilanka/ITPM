const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://admin:admin123@cluster0.m2hbix6.mongodb.net/?appName=Cluster0';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected: ' + conn.connection.host);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
