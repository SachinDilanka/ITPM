import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(apiUrl('/api/health'));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setHealth(data);
      } catch (e) {
        const msg =
          e?.message ||
          (typeof e === 'string' ? e : 'Could not reach API');
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoadingHealth(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="dashboard__hint">
        Frontend runs on port <strong>5173</strong>. API calls to <code>/api/*</code> are proxied to the
        backend on <strong>5000</strong> during development.
      </p>

      {!loading && user && (
        <section className="card create-note-cta">
          <h2>Notes</h2>
          <p className="create-note-cta__text">
            Create short notes and save them to your profile. Each note gets a <strong>unique ID</strong> for future
            AI (summaries &amp; exam questions).
          </p>
          <div className="create-note-cta__actions">
            <Link to="/notes/new" className="btn-create-note btn-create-note--large">
              Create note
            </Link>
            <Link to="/notes" className="create-note-cta__secondary">
              View my notes
            </Link>
          </div>
        </section>
      )}

      <section className="card page-links">
        <h2>Navigate</h2>
        <ul className="page-links__list">
          {!loading && user && (
            <>
              <li>
                <Link to="/all-notes">All PDFs</Link>
                <span className="page-links__desc">Browse all user notes &amp; PDFs</span>
              </li>
              <li>
                <Link to="/profile">Your profile</Link>
                <span className="page-links__desc">View account &amp; photo</span>
              </li>
            </>
          )}
          {!loading && !user && (
            <>
              <li>
                <Link to="/login">Log in</Link>
                <span className="page-links__desc">Existing account</span>
              </li>
              <li>
                <Link to="/register">Sign up</Link>
                <span className="page-links__desc">Create a student account</span>
              </li>
            </>
          )}
        </ul>
      </section>

      <section className="card">
        <h2>Backend connection</h2>
        {loadingHealth && <p>Checking API…</p>}
        {error && (
          <p className="card__error">
            <strong>Not connected:</strong> {error}
            <br />
            <span className="card__sub">
              <strong>Checklist:</strong> (1) Backend running —{' '}
              <code>cd ITPM\backend</code> then <code>npm run dev</code> (must see &quot;Server running&quot;
              and MongoDB connected). (2) Frontend — <code>cd ITPM\frontend</code> then{' '}
              <code>npm run dev</code> and open the <code>http://localhost:5173</code> link (not a saved HTML
              file). (3) If you changed <code>PORT</code> in <code>backend\.env</code>, set{' '}
              <code>VITE_API_URL</code> in <code>frontend\.env</code> to match and restart Vite.
            </span>
          </p>
        )}
        {!loadingHealth && !error && health && (
          <ul className="card__list">
            <li>
              Status: <span className="ok">{health.status}</span>
            </li>
            <li>
              Database: <span className={health.db === 'connected' ? 'ok' : 'warn'}>{health.db}</span>
            </li>
          </ul>
        )}
      </section>
    </div>
  );
}
