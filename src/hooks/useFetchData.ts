import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from '@/config/api';
import { ApiResponse } from '@/services/apiService';
import { createEmptyData } from '@/utils/fallbackData';

interface UseFetchDataOptions {
  autoFetch?: boolean;
  onError?: (error: string) => void;
}

interface UseFetchDataResult<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T>>;
}

export function useFetchData<T>(
  apiFn: () => Promise<ApiResponse<T>>,
  demoData: T,
  options: UseFetchDataOptions = {}
): UseFetchDataResult<T> {
  const { autoFetch = true, onError } = options;
  const emptyData = createEmptyData(demoData);
  const [data, setData] = useState<T>(DEMO_MODE ? demoData : emptyData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (DEMO_MODE) {
      setData(demoData);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiFn();

      if (response.success && response.data !== undefined) {
        setData(response.data);
      } else {
        const errorMsg = response.message || response.error || 'Greska pri ucitavanju';
        setError(errorMsg);
        setData(emptyData);
        onError?.(errorMsg);
        console.warn(`[API Empty State] ${errorMsg}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Nepoznata greska';
      setError(errorMsg);
      setData(emptyData);
      onError?.(errorMsg);
      console.warn(`[API Empty State] ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  }, [apiFn, demoData, emptyData, onError]);

  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [autoFetch]);

  return { data, isLoading, error, refetch, setData };
}
