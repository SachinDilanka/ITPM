import { useState, useEffect, useCallback } from 'react';

const useFetch = (fetchFn, immediate = true) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchFn(...args);
            setData(response.data);
            return response.data;
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'An error occurred';
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchFn]);

    useEffect(() => {
        if (immediate) execute();
    }, []);

    return { data, loading, error, execute, setData };
};

export default useFetch;
