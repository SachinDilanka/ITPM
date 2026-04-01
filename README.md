# KnowVerse - Intelligent Note Sharing Platform

KnowVerse is a comprehensive web platform that enables students to upload, share, rate, and manage educational notes. It features secure authentication, admin moderation, analytics, and advanced content management capabilities.

## Project Structure

```
ITPM/
├── backend/          # Node.js Express server with MongoDB
├── frontend/         # React + Vite client application
└── README.md         # This file
```

## Backend Overview

The backend is built with **Express.js** and **MongoDB**, providing RESTful APIs for note management, user authentication, admin controls, and analytics.

### Key Features
- **User Authentication** - JWT-based auth with email verification
- **Admin Approval System** - Moderate and approve user registrations
- **Note Management** - Upload, retrieve, and manage educational notes with file storage
- **Rating & Comments** - Students can rate and comment on notes
- **Content Filtering** - Automatic content moderation using Google Gemini AI
- **Translation Support** - Multi-language support using Google Translate API
- **Advanced Analytics** - Track platform usage, user activity, and note statistics
- **Error Handling** - Centralized error management with custom middleware
- **Database** - MongoDB with Mongoose ORM

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcrypt for password hashing, CORS enabled
- **File Upload**: Multer
- **AI/ML**: Google Generative AI for content analysis
- **Dev Tool**: Nodemon for development auto-reload

### Backend Scripts
```bash
npm start    # Run production server
npm run dev  # Run with auto-reload (development)
```

### API Routes
- `/api/auth` - Authentication (login, register, verify)
- `/api/notes` - Note CRUD operations
- `/api/ratings` - Rate notes
- `/api/comments` - Comment on notes
- `/api/admin` - Admin operations (user management, approvals)
- `/api/analytics` - Platform analytics
- `/api/filter` - Content filtering
- `/api/queue` - Queue management for async operations

### Core Modules
- **Controllers** - Handle request logic for each feature
- **Models** - MongoDB schemas (User, Note, Rating, Comment, Report)
- **Middleware** - Auth protection, error handling, file uploads, content validation
- **Routes** - API endpoint definitions
- **Services** - Business logic (priority queue, etc.)
- **Config** - Database connection setup

---

## Frontend Overview

The frontend is built with **React** and **Vite**, providing a fast, modern user interface for students and administrators.

### Key Features
- **Authentication Pages** - Login, registration, and pending approval system
- **Student Dashboard** - View notes, upload content, manage profile
- **Admin Dashboard** - Manage users, notes, view reports and analytics
- **Note Management** - Upload, view, and manage educational notes
- **Ratings & Comments** - Interact with notes through ratings and discussions
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Real-time API Integration** - Axios-based HTTP client with custom instance

### Tech Stack
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Styling**: CSS (with global styles)
- **Code Quality**: ESLint

### Frontend Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Check code quality
npm run preview  # Preview production build
```

### Project Structure
- **Pages** - Main page components (auth, student, admin)
- **Components** - Reusable UI components (cards, layout, buttons, modals)
- **Routes** - Route protection and configuration
- **Context** - Global state (Auth, App context)
- **Hooks** - Custom React hooks (useAuth, useFetch, useForm)
- **Api** - API client methods
- **Services** - Business logic layer
- **Utils** - Helper functions, constants, validators
- **Assets** - Static files and global styles

### Key Pages

**Authentication:**
- `Login` - User sign-in
- `Register` - New user registration
- `PendingApproval` - Approval status page

**Student:**
- `Dashboard` - Main student interface
- `Notes` - Browse and view notes
- `UploadNote` - Upload new notes
- `Profile` - User profile management

**Admin:**
- `AdminDashboard` - Admin control center
- `ManageUsers` - User administration
- `ManageNotes` - Content moderation
- `Reports` - Issue reports
- `Analytics` - Platform analytics

---

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to backend directory
```bash
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file with required variables
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_API_KEY=your_google_api_key
PORT=5000
```

4. Start the server
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory
```bash
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file if needed
```
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Start development server
```bash
npm run dev
```

---

## Development Workflow

### Backend Development
- Uses **Nodemon** for automatic restart on file changes
- API debugging with REST clients (Postman, ThunderClient)
- MongoDB database management

### Frontend Development
- **Vite** hot module reloading for instant updates
- **ESLint** for code quality checks
- React DevTools for component inspection

---

## Build & Deployment

### Backend Build
```bash
cd backend
npm start
```

### Frontend Build
```bash
cd frontend
npm run build
npm run preview
```

The frontend production build will be optimized and ready for deployment.

---

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Test thoroughly
5. Commit with clear messages
6. Push to repository

---

## Support

For issues or questions, please refer to the project documentation or contact the development team.