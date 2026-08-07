import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Generic async data fetching hook.
 * 
 * Usage:
 *   const { data, loading, error, execute } = useApi(customerService.getAll);
 *   useEffect(() => { execute(); }, []);
 */
const useApi = (apiFunction) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const apiRef = useRef(apiFunction);
  useEffect(() => {
    apiRef.current = apiFunction;
  }, [apiFunction]);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const fn = apiRef.current || apiFunction;
      const response = await fn(...args);
      const result = response.data?.data ?? response.data;
      setData(result);
      return result;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'An error occurred';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};

export default useApi;
