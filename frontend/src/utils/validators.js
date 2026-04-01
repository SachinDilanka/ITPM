export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validateLoginForm = (values) => {
    const errors = {};
    if (!values.email) errors.email = 'Email is required';
    else if (!validateEmail(values.email)) errors.email = 'Enter a valid email';
    if (!values.password) errors.password = 'Password is required';
    return errors;
};

export const validateRegisterForm = (values) => {
    const errors = {};
    if (!values.name || values.name.trim().length < 2)
        errors.name = 'Name must be at least 2 characters';
    if (!values.email) errors.email = 'Email is required';
    else if (!validateEmail(values.email)) errors.email = 'Enter a valid email';
    if (!values.password || values.password.length < 6)
        errors.password = 'Password must be at least 6 characters';
    if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (values.password !== values.confirmPassword)
        errors.confirmPassword = 'Passwords do not match';
    return errors;
};
