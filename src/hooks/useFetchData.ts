import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from '@/config/api';
import { ApiResponse } from '@/services/apiService';

/**
 * Hook za učitavanje podataka sa API-ja sa fallback-om na demo podatke.
 * 
 * @param apiFn - Funkcija koja poziva API endpoint
 * @param demoData - Demo podaci koji se koriste u DEMO_MODE ili kao fallback
 * @param options - Opcije za hook
 */
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
  const [data, setData] = useState<T>(demoData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (DEMO_MODE) {
      // U demo modu, koristi demo podatke direktno
      setData(demoData);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiFn();
      if (response.success && response.data !== undefined) {
        setData(response.data);
      } else {
        // API nije uspeo - fallback na demo podatke
        const errorMsg = response.message || response.error || 'Greška pri učitavanju';
        setError(errorMsg);
        setData(demoData);
        onError?.(errorMsg);
        console.warn(`[API Fallback] ${errorMsg} - koriste se demo podaci`);
      }
    } catch (err) {
      // Mrežna greška - fallback na demo podatke
      const errorMsg = err instanceof Error ? err.message : 'Nepoznata greška';
      setError(errorMsg);
      setData(demoData);
      onError?.(errorMsg);
      console.warn(`[API Fallback] ${errorMsg} - koriste se demo podaci`);
    } finally {
      setIsLoading(false);
    }
  }, [apiFn, demoData, onError]);

  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, []);

  return { data, isLoading, error, refetch, setData };
}
