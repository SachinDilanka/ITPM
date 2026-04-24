import mongoose from 'mongoose';

const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('Error: MONGO_URI is not set in .env');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB connected: ${conn.connection.host}`);

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err.message);
        });
        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;
