export const ROLES = {
    STUDENT: 'student',
    ADMIN: 'admin',
};

export const NOTE_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
};

export const SUBJECTS = [
    'Information Technology (SLIIT)',
    'Computer Science (SLIIT)',
    'Computer Systems Engineering (SLIIT)',
    'Computer System Networks (Curtin)',
    'Information Technology / Software Engineering',
    'Business Management',
    'Accounting & Finance',
    'Business Analytics',
    'Human Capital Management',
    'Marketing Management',
    'Civil Engineering',
    'Electrical & Electronic Engineering'
];

export const SEMESTERS = ['1', '2'];

export const PRIORITY_LEVELS = ['Low', 'Medium', 'High'];

export const YEARS = ['1', '2', '3', '4'];

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
