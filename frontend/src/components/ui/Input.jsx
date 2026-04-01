import { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    error,
    icon: Icon,
    iconRight: IconRight,
    className = '',
    type = 'text',
    as = 'input',
    children,
    ...props
}, ref) => {
    const Tag = as;

    return (
        <div className="form-group">
            {label && <label className="form-label">{label}</label>}
            <div className={`input-wrapper ${IconRight ? 'icon-right' : ''}`}>
                {Icon && <Icon size={16} className="input-icon" />}
                <Tag
                    ref={ref}
                    type={type}
                    className={`form-input ${error ? 'error' : ''} ${className}`}
                    {...props}
                >
                    {children}
                </Tag>
                {IconRight && <IconRight size={16} className="input-icon-right" />}
            </div>
            {error && <span className="form-error">{error}</span>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
