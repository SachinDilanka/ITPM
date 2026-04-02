import { loginApi, registerApi } from '../api/authApi';

export const authService = {
    async login(credentials) {
        const { data } = await loginApi(credentials);
        return data;
    },

    async register(userData) {
        const { data } = await registerApi(userData);
        return data;
    },

    saveUser(userData) {
        localStorage.setItem('userInfo', JSON.stringify(userData));
    },

    getUser() {
        try {
            const saved = localStorage.getItem('userInfo');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    },

    removeUser() {
        localStorage.removeItem('userInfo');
    },

    isAuthenticated() {
        return !!this.getUser();
    },

    getToken() {
        const user = this.getUser();
        return user?.token || null;
    },

    getRole() {
        const user = this.getUser();
        return user?.role || null;
    },
};
