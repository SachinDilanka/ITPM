# KnowVerse - Academic Study Platform

A modern MERN stack application for academic collaboration and learning.

## Features

### Core Interaction & Engagement Module

1. **Public Q&A System**
   - Post questions with title, description, and tags
   - Subject-based categorization
   - Threaded answers & comments
   - Posts visible in feed & profile
   - Like, comment, and share functionality

2. **Interactive MCQ Polls**
   - Create academic polls
   - Multiple-choice options
   - Real-time vote tracking
   - Percentage-based results

3. **Smart Tagging System**
   - Tag by Module, Semester, Subject
   - Mention other students (@username)
   - Clickable tags for filtering

4. **AI Answer Highlighting**
   - Analyze answers automatically
   - Highlight best responses
   - Summary preview
   - Detect top answers

## Tech Stack

### Frontend
- React 18
- Material-UI (MUI)
- React Router
- Axios for API calls
- Lucide React Icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Database

MongoDB Atlas Connection:
```
mongodb+srv://admin:admin123@cluster0.m2hbix6.mongodb.net/?appName=Cluster0
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get single question with answers
- `POST /api/questions` - Create new question
- `POST /api/questions/:id/like` - Like/unlike question
- `POST /api/questions/:id/share` - Share question

### Polls
- `GET /api/polls` - Get all polls
- `GET /api/polls/:id` - Get single poll
- `POST /api/polls` - Create new poll
- `POST /api/polls/:id/vote` - Vote in poll
- `GET /api/polls/:id/results` - Get poll results

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/questions` - Get user's questions
- `GET /api/users/search/:query` - Search users

## Project Structure

```
KnowVerse/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Question.js
│   │   ├── Answer.js
│   │   ├── Poll.js
│   │   └── Comment.js
│   ├── routes/
│   │   ├── questions.js
│   │   ├── polls.js
│   │   └── users.js
│   └── app.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Questions.jsx
│   │   │   ├── Polls.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   └── App.jsx
│   └── public/
└── README.md
```

## Benefits to Students

- **Saves time finding answers** - Quick access to peer-reviewed solutions
- **Improves exam preparation** - Interactive polls and Q&A sessions
- **Builds academic reputation** - Earn reputation points for quality contributions
- **Promotes active participation** - Engaging interface encourages involvement
- **Increased engagement** - Social features boost community interaction
- **Knowledge sharing** - Collaborative learning environment
- **Interactive community** - Real-time discussions and feedback

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
