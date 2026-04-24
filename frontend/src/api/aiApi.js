import axiosInstance from './axiosInstance';

export const postDashboardAiChatApi = (message) =>
    axiosInstance.post('/ai/chat', { message });
