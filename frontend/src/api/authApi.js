import axiosInstance from './axiosInstance';

export const loginApi = (credentials) =>
    axiosInstance.post('/auth/login', credentials);

export const registerApi = (userData) =>
    axiosInstance.post('/auth/register', userData);

export const uploadAvatarApi = (formData) =>
    axiosInstance.post('/auth/profile/avatar', formData);

export const updateProfileApi = (data) => axiosInstance.put('/auth/profile', data);

export const getProfileSummaryApi = () => axiosInstance.get('/auth/profile/summary');

export const deleteAccountApi = (password) =>
    axiosInstance.delete('/auth/account', { data: { password } });
