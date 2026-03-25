import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyNotes from './pages/MyNotes';
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
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <NavBar />

        <main className="app-main">
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
