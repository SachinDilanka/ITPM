import mongoose from 'mongoose';

const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('Error: MONGO_URI is not defined in environment variables');
        process.exit(1);
    }
    try {
        const conn = await mongoose.connect(uri, {
            maxPoolSize: 10,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
