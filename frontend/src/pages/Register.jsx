import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not sign up');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="page-loading">
        <p>Loading…</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-back">
          <Link to="/">← Home</Link>
        </p>
        <h1>Create account</h1>
        <p className="auth-sub">
          Already have an account? <Link to="/login">Log in</Link>
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <p className="auth-error">{error}</p>}

          <label htmlFor="reg-name">Full name</label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
          />

          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <button type="submit" disabled={submitting} className="auth-submit">
            {submitting ? 'Creating account…' : 'Sign up'}
          </button>
        </form>
      </div>
    </div>
  );
}
