const Spinner = ({ size = 'md', overlay = false, message = 'Loading...' }) => {
    const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : '';

    if (overlay) {
        return (
            <div className="spinner-overlay">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div className={`spinner ${sizeClass}`} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="loading-container">
            <div className={`spinner ${sizeClass}`} />
            <p>{message}</p>
        </div>
    );
};

export default Spinner;
