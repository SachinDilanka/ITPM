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

export const getPublicNoteByIdApi = (id) =>
    axiosInstance.get(`/notes/public/${id}`);

export const getMyNoteByIdApi = (id) =>
    axiosInstance.get(`/notes/${id}`);

export const updateMyNoteApi = (id, formData) =>
    axiosInstance.put(`/notes/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

/** Report another student's approved note (requires auth). Body: { comment: string } */
export const reportNoteApi = (id, body) => axiosInstance.post(`/notes/${id}/report`, body);

/** OpenAI-backed study guide for admin-approved notes (requires auth). */
export const postNoteAiStudyGuideApi = (id) =>
    axiosInstance.post(`/notes/ai/study-guide/${id}`);

