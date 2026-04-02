import axiosInstance from './axiosInstance';

export const getCommentsByPdfId = (pdfId) =>
    axiosInstance.get(`/comments/pdf/${pdfId}`);

export const createCommentApi = (commentData) =>
    axiosInstance.post('/comments', commentData);

export const updateCommentApi = (id, commentData) =>
    axiosInstance.put(`/comments/${id}`, commentData);

export const deleteCommentApi = (id) =>
    axiosInstance.delete(`/comments/${id}`);
