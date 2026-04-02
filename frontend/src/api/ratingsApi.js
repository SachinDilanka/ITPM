import axiosInstance from './axiosInstance';

export const upsertRatingApi = (ratingData) =>
    axiosInstance.post('/ratings', ratingData);

export const getRatingSummariesApi = (noteIds) =>
    axiosInstance.get('/ratings/summary', {
        params: { noteIds: noteIds.join(',') },
    });

export const getMyNotesRatingStatsApi = () =>
    axiosInstance.get('/ratings/my-notes-stats');

