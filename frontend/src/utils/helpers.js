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
