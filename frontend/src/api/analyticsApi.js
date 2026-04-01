import axiosInstance from './axiosInstance';

export const getDashboardStatsApi = () =>
    axiosInstance.get('/analytics/dashboard');
