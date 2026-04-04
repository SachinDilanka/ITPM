import axiosInstance from './axiosInstance';

export const upsertRatingApi = (ratingData) =>
    axiosInstance.post('/ratings', ratingData);

export const getRatingSummariesApi = (noteIds) =>
    axiosInstance.get('/ratings/summary', {
        params: { noteIds: noteIds.join(',') },
    });

export const getMyNotesRatingStatsApi = () =>
    axiosInstance.get('/ratings/my-notes-stats');

export const deleteRatingApi = (ratingId) =>
    axiosInstance.delete(`/ratings/${ratingId}`);

export const getAllRatingsApi = () =>
    axiosInstance.get('/ratings');

export const getRatingsByNoteIdApi = (noteId) =>
    axiosInstance.get(`/ratings/note/${noteId}`);

export const getTopRatedNotesApi = (limit = 10) =>
    axiosInstance.get('/ratings/top', { params: { limit } });

export const getTopRatedUsersApi = (limit = 10) =>
    axiosInstance.get('/ratings/top-users', { params: { limit } });

