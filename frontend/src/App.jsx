import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyNotes from './pages/MyNotes';
import AllNotes from './pages/AllNotes';
import NoteMaker from './pages/NoteMaker';
import NoteDetail from './pages/NoteDetail';
import NoteEdit from './pages/NoteEdit';
import './App.css';

function navClass({ isActive }) {
  return isActive ? 'app-nav__link app-nav__link--active' : 'app-nav__link';
}

function NavBar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="app-nav">
      <ul className="app-nav__links">
        <li className="app-nav__brand">
          <NavLink to="/" end className="app-nav__logo">
            KnowVerse
          </NavLink>
        </li>
        <li>
          <NavLink to="/" end className={navClass}>
            Dashboard
          </NavLink>
        </li>
        {!loading && user && (
          <>
            <li>
              <NavLink to="/notes" className={navClass}>
                My notes
              </NavLink>
            </li>
            <li>
              <NavLink to="/all-notes" className={navClass}>
                All notes
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={navClass}>
                Profile
              </NavLink>
            </li>
          </>
        )}
        <li className="app-nav__spacer" />
        {!loading && user && (
          <li>
            <button type="button" className="app-nav__btn" onClick={logout}>
              Log out
            </button>
          </li>
        )}
        {!loading && !user && (
          <>
            <li>
              <NavLink to="/login" className={navClass}>
                Log in
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `app-nav__link app-nav__cta${isActive ? ' app-nav__link--active' : ''}`
                }
              >
                Sign up
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

function App() {
  function AppContent() {
    const location = useLocation();
    const isAllNotesPage = location.pathname === '/all-notes';

    return (
      <div className="App">
        <NavBar />

        <main className={`app-main${isAllNotesPage ? ' app-main--wide' : ''}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/notes/new"
              element={
                <PrivateRoute>
                  <NoteMaker />
                </PrivateRoute>
              }
            />
            <Route
              path="/notes/:id/edit"
              element={
                <PrivateRoute>
                  <NoteEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="/notes/:id"
              element={
                <PrivateRoute>
                  <NoteDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/notes"
              element={
                <PrivateRoute>
                  <MyNotes />
                </PrivateRoute>
              }
            />
            <Route
              path="/all-notes"
              element={
                <PrivateRoute>
                  <AllNotes />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </Router>
  );
}
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './routes/AppRoutes';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PendingApproval from './pages/auth/PendingApproval';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import Notes from './pages/student/Notes';
import UploadNote from './pages/student/UploadNote';
import Profile from './pages/student/Profile';
import EditNote from './pages/student/EditNote';
import NoteDetail from './pages/student/NoteDetail';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageNotes from './pages/admin/ManageNotes';
import Reports from './pages/admin/Reports';
import Analytics from './pages/admin/Analytics';

// Shared
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Routes (redirect if already logged in AND approved) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
      </Route>

      {/* Student Routes */}
      <Route element={<ProtectedRoute requiredRole="student" />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/notes" element={<Notes />} />
        <Route path="/student/upload" element={<UploadNote />} />
        <Route path="/student/profile" element={<Profile />} />
        <Route path="/student/notes/:id" element={<NoteDetail />} />
        <Route path="/student/notes/:id/edit" element={<EditNote />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/notes" element={<ManageNotes />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/analytics" element={<Analytics />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
