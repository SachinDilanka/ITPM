import axiosInstance from './axiosInstance';

export const filterNotesApi = (params) =>
    axiosInstance.get('/filter/notes', { params });

export const getPendingQueueApi = () =>
    axiosInstance.get('/queue/pending');

export const createNoteApi = (formData) =>
    axiosInstance.post('/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const getMyNotesApi = () =>
    axiosInstance.get('/notes/my');

