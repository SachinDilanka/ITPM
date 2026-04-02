// Test MongoDB connection and add initial data
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://admin:admin123@cluster0.m2hbix6.mongodb.net/';

async function connectAndSetup() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const conn = await mongoose.connect(MONGODB_URI);
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database Host:', conn.connection.host);
    console.log('🗄️  Database Name:', conn.connection.name || 'KnowVerse (default)');
    
    const db = mongoose.connection.db;
    
    // Create some initial collections and data
    console.log('📝 Setting up initial data...');
    
    // Create a sample user
    const usersCollection = db.collection('users');
    const sampleUser = {
      username: 'admin',
      fullName: 'Administrator',
      email: 'admin@knowverse.com',
      password: 'admin123', // In production, this should be hashed
      reputation: 100,
      createdAt: new Date()
    };
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ username: 'admin' });
    if (!existingUser) {
      await usersCollection.insertOne(sampleUser);
      console.log('✅ Sample user created');
    } else {
      console.log('ℹ️ Sample user already exists');
    }
    
    // Create sample questions
    const questionsCollection = db.collection('questions');
    const sampleQuestions = [
      {
        title: 'What is React?',
        description: 'Can someone explain what React is and how it works?',
        author: existingUser?._id || 'admin',
        tags: ['react', 'javascript', 'frontend'],
        subject: 'Introduction to Programming',
        year: 1,
        semester: 1,
        likes: [],
        views: 0,
        aiHighlighted: false,
        comments: [],
        shares: 0,
        sharedBy: [],
        createdAt: new Date()
      },
      {
        title: 'How does MongoDB work?',
        description: 'I need help understanding the basics of MongoDB and NoSQL databases.',
        author: existingUser?._id || 'admin',
        tags: ['mongodb', 'database', 'nosql'],
        subject: 'Database Systems',
        year: 2,
        semester: 1,
        likes: [],
        views: 0,
        aiHighlighted: false,
        comments: [],
        shares: 0,
        sharedBy: [],
        createdAt: new Date()
      }
    ];
    
    // Check if questions already exist
    const existingQuestions = await questionsCollection.countDocuments();
    if (existingQuestions === 0) {
      await questionsCollection.insertMany(sampleQuestions);
      console.log('✅ Sample questions created');
    } else {
      console.log('ℹ️ Sample questions already exist');
    }
    
    // Create sample polls
    const pollsCollection = db.collection('polls');
    const samplePolls = [
      {
        title: 'Favorite Programming Language',
        description: 'What is your favorite programming language for web development?',
        options: [
          { text: 'JavaScript', votes: [] },
          { text: 'Python', votes: [] },
          { text: 'Java', votes: [] },
          { text: 'TypeScript', votes: [] }
        ],
        author: existingUser?._id || 'admin',
        subject: 'Introduction to Programming',
        year: 1,
        semester: 1,
        isMultipleChoice: false,
        isActive: true,
        isEnded: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Database Preference',
        description: 'Which database system do you prefer for applications?',
        options: [
          { text: 'MongoDB', votes: [] },
          { text: 'MySQL', votes: [] },
          { text: 'PostgreSQL', votes: [] },
          { text: 'SQLite', votes: [] }
        ],
        author: existingUser?._id || 'admin',
        subject: 'Database Systems',
        year: 2,
        semester: 1,
        isMultipleChoice: false,
        isActive: true,
        isEnded: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Check if polls already exist
    const existingPolls = await pollsCollection.countDocuments();
    if (existingPolls === 0) {
      await pollsCollection.insertMany(samplePolls);
      console.log('✅ Sample polls created');
    } else {
      console.log('ℹ️ Sample polls already exist');
    }
    
    // Show collection summary
    console.log('\n📊 Database Summary:');
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  📁 ${collection.name}: ${count} documents`);
    }
    
    console.log('\n🎉 MongoDB setup completed successfully!');
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

connectAndSetup();
