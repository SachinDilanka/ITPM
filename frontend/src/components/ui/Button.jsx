const Button = ({
    children,
    variant = 'primary',
    size = '',
    full = false,
    icon = false,
    loading = false,
    className = '',
    ...props
}) => {
    const classes = [
        'btn',
        `btn-${variant}`,
        size && `btn-${size}`,
        full && 'btn-full',
        icon && 'btn-icon',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button className={classes} disabled={loading || props.disabled} {...props}>
            {loading ? (
                <>
                    <span className="spinner spinner-sm" />
                    Loading...
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
