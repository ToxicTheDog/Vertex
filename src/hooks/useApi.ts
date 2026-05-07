import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from '@/config/api';
import { ApiResponse } from '@/services/apiService';
import { createEmptyData } from '@/utils/fallbackData';

interface UseApiOptions<T> {
  initialData?: T;
  fetchOnMount?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: (data: T | null) => void;
}

export function useApi<T>(
  fetchFn: () => Promise<ApiResponse<T>>,
  demoData: T,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const { initialData, fetchOnMount = true, onSuccess, onError } = options;
  const emptyData = createEmptyData(demoData);

  const [data, setData] = useState<T | null>(initialData ?? (DEMO_MODE ? demoData : emptyData));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (DEMO_MODE) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setData(demoData);
        onSuccess?.(demoData);
      } else {
        const response = await fetchFn();

        if (response.success && response.data !== undefined) {
          setData(response.data);
          onSuccess?.(response.data);
        } else {
          const errorMsg = response.error || response.message || 'Greska pri ucitavanju podataka';
          setError(errorMsg);
          onError?.(errorMsg);
          setData(emptyData);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Nepoznata greska';
      setError(errorMsg);
      onError?.(errorMsg);
      setData(emptyData);
    } finally {
      setIsLoading(false);
    }
  }, [demoData, emptyData, fetchFn, onError, onSuccess]);

  useEffect(() => {
    if (fetchOnMount) {
      refetch();
    }
  }, [fetchOnMount]);

  return { data, isLoading, error, refetch, setData };
}

interface UseRealtimeOptions {
  interval?: number;
  enabled?: boolean;
}

export function useRealtime<T>(
  fetchFn: () => Promise<T>,
  options: UseRealtimeOptions = {}
): { data: T | null; isConnected: boolean } {
  const { interval = 30000, enabled = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let intervalId: NodeJS.Timeout;
    let mounted = true;

    const fetch = async () => {
      try {
        const result = await fetchFn();
        if (mounted) {
          setData(result);
          setIsConnected(true);
        }
      } catch {
        if (mounted) {
          setIsConnected(false);
        }
      }
    };

    fetch();
    intervalId = setInterval(fetch, interval);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [enabled, fetchFn, interval]);

  return { data, isConnected };
}

interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData) => void;
  onError?: (error: string) => void;
}

interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | null>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const { onSuccess, onError } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (variables: TVariables): Promise<TData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await mutationFn(variables);

      if (response.success) {
        onSuccess?.(response.data as TData);
        return response.data ?? null;
      }

      const errorMsg = response.error || response.message || 'Greska pri obradi zahteva';
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Nepoznata greska';
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, onError, onSuccess]);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, isLoading, error, reset };
}
