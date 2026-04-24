import axios from 'axios';

// Relative `/api` uses the Vite dev proxy (vite.config.js → backend PORT). Set VITE_API_URL for production.
const base = (import.meta.env.VITE_API_URL || '').trim();
const baseURL = base || '/api';

const axiosInstance = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor – attach JWT token from localStorage
axiosInstance.interceptors.request.use(
    (config) => {
        // Default JSON Content-Type makes axios stringify FormData as JSON — multer then sees no file
        if (config.data instanceof FormData && config.headers) {
            if (typeof config.headers.delete === 'function') {
                config.headers.delete('Content-Type');
            } else {
                delete config.headers['Content-Type'];
            }
        }
        let bearer = null;
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                bearer = JSON.parse(userInfo).token;
            } catch {
                /* ignore */
            }
        }
        if (!bearer) bearer = localStorage.getItem('token');
        if (bearer) {
            config.headers.Authorization = `Bearer ${bearer}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor – handle 401 globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
