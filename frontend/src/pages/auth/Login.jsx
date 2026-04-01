import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, BookOpen, CheckCircle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useForm from '../../hooks/useForm';
import { validateLoginForm } from '../../utils/validators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Login = () => {
    const { login, loading, error, clearError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);

    // Message passed from Register page after successful registration
    const successMessage = location.state?.successMessage || null;

    const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
        { email: '', password: '' },
        validateLoginForm
    );

    const onSubmit = async (formValues) => {
        clearError();
        const result = await login(formValues);
        if (result.success) {
            if (result.role === 'admin') {
                // Admins are always auto-approved
                navigate('/admin/dashboard');
            } else if (result.isApproved) {
                // Approved student → go to dashboard
                navigate('/student/dashboard');
            } else {
                // Student pending approval → go to waiting page
                navigate('/pending-approval');
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <BookOpen size={28} color="#fff" />
                    </div>
                    <h1>Welcome back</h1>
                    <p>Sign in to your KnowVerse account</p>
                </div>

                {/* Success message coming from Register redirect */}
                {successMessage && (
                    <div className="alert alert-success" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={18} />
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="you@university.edu"
                        icon={Mail}
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && errors.email}
                    />

                    <Input
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        icon={Lock}
                        iconRight={() => (
                            <span onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </span>
                        )}
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.password && errors.password}
                    />

                    <Button type="submit" variant="primary" full loading={loading} style={{ marginTop: '0.5rem' }}>
                        Sign In
                    </Button>
                </form>

                <div className="auth-link">
                    Don't have an account? <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
