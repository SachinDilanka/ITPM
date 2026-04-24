export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

/** Full URL for paths served by the API origin (e.g. /uploads/...) */
export const getMediaUrl = (relativePath) => {
    if (!relativePath || typeof relativePath !== 'string') return '';
    const p = relativePath.trim();
    if (!p) return '';
    if (p.startsWith('http://') || p.startsWith('https://')) return p;
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    return `${base}${p.startsWith('/') ? p : `/${p}`}`;
};

export const getInitials = (name = '') => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export const capitalizeFirst = (str = '') =>
    str.charAt(0).toUpperCase() + str.slice(1);

/** Works whether the API sent `_id` or `id` (login /auth/me, etc.). */
export const getUserMongoId = (user) => {
    if (!user) return null;
    return user._id ?? user.id ?? null;
};

/** Uploader id whether `uploadedBy` is populated `{ _id, name }` or a raw ObjectId. */
export const getNoteUploaderId = (note) => {
    const u = note?.uploadedBy;
    if (u == null) return null;
    if (typeof u === 'object') return u._id ?? u.id ?? null;
    return u;
};

export const idsEqual = (a, b) => {
    if (a == null || b == null) return false;
    return String(a) === String(b);
};

export const statusBadgeClass = (status) => {
    const map = {
        approved: 'badge-success',
        pending: 'badge-warning',
        rejected: 'badge-danger',
        suspended: 'badge-danger',
        active: 'badge-success',
    };
    return map[status?.toLowerCase()] || 'badge-default';
};
