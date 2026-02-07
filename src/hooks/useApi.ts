import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from '@/config/api';
import { ApiResponse } from '@/services/apiService';

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
  
  const [data, setData] = useState<T | null>(initialData ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (DEMO_MODE) {
        // U demo modu, koristi demo podatke
        await new Promise(resolve => setTimeout(resolve, 300)); // Simuliraj delay
        setData(demoData);
        onSuccess?.(demoData);
      } else {
        const response = await fetchFn();
        
        if (response.success && response.data) {
          setData(response.data);
          onSuccess?.(response.data);
        } else {
          const errorMsg = response.error || response.message || 'Greška pri učitavanju podataka';
          setError(errorMsg);
          onError?.(errorMsg);
          // Postavi demo podatke kao fallback
          setData(demoData);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Nepoznata greška';
      setError(errorMsg);
      onError?.(errorMsg);
      // Postavi demo podatke kao fallback
      setData(demoData);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, demoData, onSuccess, onError]);

  useEffect(() => {
    if (fetchOnMount) {
      refetch();
    }
  }, [fetchOnMount]); // Ne uključuj refetch u dependencies jer se menja

  return { data, isLoading, error, refetch, setData };
}

// Hook za real-time ažuriranja
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

    // Inicijalni fetch
    fetch();

    // Postavi interval
    intervalId = setInterval(fetch, interval);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [fetchFn, interval, enabled]);

  return { data, isConnected };
}

// Hook za mutacije (create, update, delete)
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
      } else {
        const errorMsg = response.error || response.message || 'Greška pri obradi zahteva';
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Nepoznata greška';
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, onSuccess, onError]);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, isLoading, error, reset };
}
