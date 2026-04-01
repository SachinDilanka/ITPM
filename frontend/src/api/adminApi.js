import axiosInstance from './axiosInstance';

// Users
export const getPendingUsersApi = () =>
    axiosInstance.get('/admin/users/pending');

export const getAllStudentsApi = () =>
    axiosInstance.get('/admin/users/all');

export const getSuspendedStudentsApi = () =>
    axiosInstance.get('/admin/users/suspended');


export const approveUserApi = (id) =>
    axiosInstance.put(`/admin/users/${id}/approve`);

export const suspendUserApi = (id) =>
    axiosInstance.put(`/admin/users/${id}/suspend`);

export const reactivateUserApi = (id) =>
    axiosInstance.put(`/admin/users/${id}/reactivate`);

// Notes
export const approveNoteApi = (id) =>
    axiosInstance.put(`/admin/notes/${id}/approve`);

export const rejectNoteApi = (id) =>
    axiosInstance.put(`/admin/notes/${id}/reject`);

export const updateNotePriorityApi = (id, data) =>
    axiosInstance.put(`/admin/notes/${id}/priority`, data);

// Reports
export const getReportedNotesApi = () =>
    axiosInstance.get('/admin/reports');
