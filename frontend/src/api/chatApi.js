import axiosInstance from './axiosInstance';

export const getChatStudentsApi = (params = {}) =>
    axiosInstance.get('/chat/students', { params });

export const getChatConversationsApi = () =>
    axiosInstance.get('/chat/conversations');

export const getChatUnreadCountApi = () =>
    axiosInstance.get('/chat/unread-count');

export const getConversationApi = (otherUserId) =>
    axiosInstance.get(`/chat/conversation/${otherUserId}`);

export const sendConversationMessageApi = (otherUserId, body, config = {}) => {
    if (body instanceof FormData) {
        return axiosInstance.post(`/chat/conversation/${otherUserId}`, body, {
            headers: { 'Content-Type': 'multipart/form-data' },
            ...config,
        });
    }
    return axiosInstance.post(`/chat/conversation/${otherUserId}`, body || {}, config);
};
