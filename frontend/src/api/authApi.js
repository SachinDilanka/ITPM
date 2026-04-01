import axiosInstance from './axiosInstance';

export const loginApi = (credentials) =>
    axiosInstance.post('/auth/login', credentials);

export const registerApi = (userData) =>
    axiosInstance.post('/auth/register', userData);
