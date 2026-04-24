import axiosInstance from './axiosInstance';

export const getCommentsByNoteIdApi = (noteId) =>
    axiosInstance.get(`/comments/pdf/${noteId}`);

export const createNoteCommentApi = (body) => axiosInstance.post('/comments', body);

export const deleteNoteCommentApi = (commentId) => axiosInstance.delete(`/comments/${commentId}`);
