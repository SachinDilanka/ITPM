import axiosInstance from './axiosInstance';

export const sendChatMessageApi = (message, history = []) =>
    axiosInstance.post('/chatbot', { message, history });
