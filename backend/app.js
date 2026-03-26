const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

const questionsRouter = require('./routes/questions');
const pollsRouter = require('./routes/polls');
const usersRouter = require('./routes/users');
const commentsRouter = require('./routes/comments');
const aiRouter = require('./routes/ai');

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add cache control headers
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});

app.use('/api/questions', questionsRouter);
app.use('/api/polls', pollsRouter);
app.use('/api/users', usersRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/ai', aiRouter);

// Error handling middleware for async routes
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

app.get('/', function(req, res) {
  res.json({ message: 'KnowVerse API Server is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, function() {
  console.log('Server is running on port ' + PORT);
});
