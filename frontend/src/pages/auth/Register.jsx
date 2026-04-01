import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, BookOpen, CheckCircle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useForm from '../../hooks/useForm';
import { validateRegisterForm } from '../../utils/validators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Register = () => {
    const { register, loading, error, clearError } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [registered, setRegistered] = useState(false);

    const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
        { name: '', email: '', password: '', confirmPassword: '', role: 'student' },
        validateRegisterForm
    );

    const onSubmit = async (formValues) => {
        clearError();
        const { confirmPassword, ...userData } = formValues;
        const result = await register(userData);
        if (result.success) {
            // Always redirect to /login — students need admin approval first.
            // Admins are auto-approved so they can log in right away.
            setRegistered(true);
            setTimeout(() => {
                navigate('/login', {
                    state: {
                        successMessage:
                            result.role === 'student'
                                ? 'Account created! Please log in. Your account will be activated after admin approval.'
                                : 'Admin account created! You can log in now.',
                    },
                });
            }, 1500);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: 480 }}>
                <div className="auth-header">
                    <div className="auth-logo">
                        <BookOpen size={28} color="#fff" />
                    </div>
                    <h1>Create Account</h1>
                    <p>Join KnowVerse — your academic knowledge hub</p>
                </div>

                {registered && (
                    <div className="alert alert-success" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={18} />
                        Account created successfully! Redirecting to login...
                    </div>
                )}

                {error && !registered && (
                    <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        label="Full Name"
                        name="name"
                        placeholder="Sayuri Imasha"
                        icon={User}
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.name && errors.name}
                    />

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

                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <select
                            name="role"
                            className="form-input"
                            value={values.role}
                            onChange={handleChange}
                        >
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                        </select>
                        {values.role === 'student' && (
                            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                ℹ️ Student accounts require admin approval before login.
                            </span>
                        )}
                    </div>

                    <Input
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimum 6 characters"
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

                    <Input
                        label="Confirm Password"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Repeat your password"
                        icon={Lock}
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.confirmPassword && errors.confirmPassword}
                    />

                    <Button type="submit" variant="primary" full loading={loading} style={{ marginTop: '0.5rem' }}>
                        Create Account
                    </Button>
                </form>

                <div className="auth-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
