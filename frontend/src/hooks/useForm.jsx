import { useState } from 'react';

const useForm = (initialValues, validate) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
        if (touched[name] && validate) {
            const validationErrors = validate({ ...values, [name]: value });
            setErrors(validationErrors);
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        if (validate) {
            const validationErrors = validate(values);
            setErrors(validationErrors);
        }
    };

    const handleSubmit = (onSubmit) => (e) => {
        e.preventDefault();
        if (validate) {
            const validationErrors = validate(values);
            setErrors(validationErrors);
            setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
            if (Object.keys(validationErrors).length > 0) return;
        }
        onSubmit(values);
    };

    const reset = () => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    };

    return { values, errors, touched, handleChange, handleBlur, handleSubmit, reset, setValues };
};

export default useForm;
