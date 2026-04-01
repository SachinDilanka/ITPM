import { createContext, useState, useEffect, useCallback } from 'react';
import { loginApi, registerApi } from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('userInfo');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const clearError = () => setError(null);

    const login = useCallback(async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await loginApi(credentials);
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return { success: true, role: data.role, isApproved: data.isApproved };
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please try again.';
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await registerApi(userData);
            // Do NOT log the user in automatically.
            // Students need admin approval before accessing the platform.
            // Redirect them to the login page instead.
            return { success: true, role: data.role };
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('userInfo');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
            {children}
        </AuthContext.Provider>
    );
};
