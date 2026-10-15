import { useState, useCallback } from 'react';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  initialData?: T;
}

export function useApi<T, Args extends any[] = any[]>(
  apiFunc: (...args: Args) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunc(...args);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err: any) {
        const message =
          err.response?.data?.message || err.message || 'An unexpected error occurred';
        setError(message);
        options.onError?.(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc, options]
  );

  return { data, loading, error, execute, setData };
}
