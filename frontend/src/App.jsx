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
