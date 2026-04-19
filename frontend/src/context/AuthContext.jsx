import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiUrl } from '../config/api';

export const AuthContext = createContext(null);

const mapUser = (u) => {
    if (!u) return null;
    const pic = u.profilePicture || u.avatarUrl || '';
    return {
        ...u,
        id: u.id ?? u._id,
        profilePicture: u.profilePicture ?? (u.avatarUrl || null),
        avatarUrl: pic,
        isApproved: u.isApproved ?? u.role === 'admin',
        isSuspended: Boolean(u.isSuspended),
    };
};

const parseLoginArgs = (a, b) => {
    if (a && typeof a === 'object' && 'email' in a) {
        return { email: a.email, password: a.password ?? '' };
    }
    return { email: a, password: b ?? '' };
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const clearError = useCallback(() => setError(null), []);

    const patchUser = useCallback((partial) => {
        setUser((prev) => {
            if (!prev) return prev;
            const next = { ...prev, ...partial };
            if (partial.profilePicture != null || partial.avatarUrl != null) {
                const pic = next.profilePicture || next.avatarUrl || '';
                next.profilePicture = next.profilePicture ?? pic;
                next.avatarUrl = pic;
            }
            try {
                localStorage.setItem('user', JSON.stringify(next));
            } catch {
                /* ignore */
            }
            return next;
        });
    }, []);

    const loadUser = useCallback(async () => {
        const t = localStorage.getItem('token');
        if (!t) {
            setUser(null);
            setToken(null);
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(apiUrl('/api/auth/me'), {
                headers: { Authorization: `Bearer ${t}` },
            });
            if (!res.ok) throw new Error('Session expired');
            const json = await res.json();
            if (localStorage.getItem('token') !== t) return;
            const u = mapUser(json.data);
            setUser(u);
            setToken(t);
            try {
                localStorage.setItem('user', JSON.stringify(u));
            } catch {
                /* ignore */
            }
        } catch {
            if (localStorage.getItem('token') !== t) return;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const t = localStorage.getItem('token');
        if (t) {
            loadUser();
            return;
        }
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
    }, [loadUser]);

    const login = async (emailOrForm, passwordMaybe) => {
        clearError();
        const { email, password } = parseLoginArgs(emailOrForm, passwordMaybe);
        try {
            const response = await fetch(apiUrl('/api/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            let data = {};
            try {
                data = await response.json();
            } catch {
                /* non-JSON body */
            }

            if (!response.ok) {
                const msg = data.message || 'Login failed';
                setError(msg);
                return { success: false, error: msg };
            }

            const u = mapUser(data.data.user);
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(u));
            setToken(data.data.token);
            setUser(u);
            setLoading(false);
            return {
                success: true,
                user: u,
                role: u.role,
                isApproved: u.isApproved,
            };
        } catch (err) {
            const msg = err.message || 'Login failed';
            setError(msg);
            return { success: false, error: msg };
        }
    };

    const register = async (userData, emailArg, passwordArg) => {
        clearError();
        let name;
        let email;
        let password;
        let role;
        let username;
        let bio;
        let semester;
        let branch;
        if (userData && typeof userData === 'object' && 'email' in userData) {
            ({ name, email, password, role, username, bio, semester, branch } = userData);
        } else {
            name = userData;
            email = emailArg;
            password = passwordArg;
        }
        const payload = { name, email, password };
        if (role) payload.role = role;
        if (username != null && String(username).trim()) payload.username = String(username).trim();
        if (bio != null && String(bio).trim()) payload.bio = String(bio).trim();
        if (semester !== undefined && semester !== null && semester !== '') payload.semester = Number(semester);
        if (branch != null && String(branch).trim()) payload.branch = String(branch).trim();

        try {
            const response = await fetch(apiUrl('/api/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            let data = {};
            try {
                data = await response.json();
            } catch {
                /* non-JSON body */
            }

            if (!response.ok) {
                const msg = data.message || 'Registration failed';
                setError(msg);
                return { success: false, error: msg };
            }

            const u = mapUser(data.data.user);
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(u));
            setToken(data.data.token);
            setUser(u);
            setLoading(false);
            return { success: true, user: u, role: u.role };
        } catch (err) {
            const msg = err.message || 'Registration failed';
            setError(msg);
            return { success: false, error: msg };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
    };

    const value = {
        user,
        token,
        login,
        register,
        logout,
        loading,
        isAuthenticated: Boolean(user),
        error,
        clearError,
        loadUser,
        patchUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
