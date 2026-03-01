import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <nav style={{ padding: '1rem', background: '#f4f4f4', marginBottom: '2rem' }}>
                    <ul style={{ listStyle: 'none', display: 'flex', gap: '1rem', margin: 0, padding: 0 }}>
                        <li>
                            <Link to="/">Dashboard</Link>
                        </li>
                    </ul>
                </nav>

                <main style={{ padding: '0 2rem' }}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
