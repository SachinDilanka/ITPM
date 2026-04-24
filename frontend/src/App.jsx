import { Routes, Route, Navigate } from 'react-router-dom';

/** Short paths → student app (same as CRA-style routes). Auth handled by ProtectedRoute on targets. */
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
import StudentQuestions from './pages/student/Questions';
import StudentPolls from './pages/student/Polls';
import MyDashboard from './pages/student/MyDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageNotes from './pages/admin/ManageNotes';
import Reports from './pages/admin/Reports';
import Analytics from './pages/admin/Analytics';

// Shared
import NotFound from './pages/NotFound';
import Home from './pages/Home';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/questions" element={<Navigate to="/student/questions" replace />} />
            <Route path="/polls" element={<Navigate to="/student/polls" replace />} />
            <Route path="/profile" element={<Navigate to="/student/profile" replace />} />

            <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/pending-approval" element={<PendingApproval />} />
            </Route>

            <Route element={<ProtectedRoute requiredRole="student" />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/questions" element={<StudentQuestions />} />
                <Route path="/student/polls" element={<StudentPolls />} />
                <Route path="/student/my-dashboard" element={<MyDashboard />} />
                <Route path="/student/notes" element={<Notes />} />
                <Route path="/student/upload" element={<UploadNote />} />
                <Route path="/student/profile" element={<Profile />} />
                <Route path="/student/notes/:id" element={<NoteDetail />} />
                <Route path="/student/notes/:id/edit" element={<EditNote />} />
            </Route>

            <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/notes" element={<ManageNotes />} />
                <Route path="/admin/notes/:id" element={<NoteDetail />} />
                <Route path="/admin/reports" element={<Reports />} />
                <Route path="/admin/analytics" element={<Analytics />} />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default App;
