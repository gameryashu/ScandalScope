import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/useToast';

interface ApiRequestOptions {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface ApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useApiRequest<T = any>(
  defaultOptions: ApiRequestOptions = {}
) {
  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { error: showError } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (
    url: string,
    options: RequestInit & ApiRequestOptions = {}
  ): Promise<T | null> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    const {
      retries = defaultOptions.retries ?? 3,
      retryDelay = defaultOptions.retryDelay ?? 1000,
      timeout = defaultOptions.timeout ?? 15000,
      onSuccess = defaultOptions.onSuccess,
      onError = defaultOptions.onError,
      ...fetchOptions
    } = options;

    setState(prev => ({ ...prev, loading: true, error: null }));

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Set timeout
        const timeoutId = setTimeout(() => {
          abortControllerRef.current?.abort();
        }, timeout);

        const response = await fetch(url, {
          ...fetchOptions,
          signal: abortControllerRef.current.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        setState({ data, loading: false, error: null });
        onSuccess?.(data);
        
        return data;

      } catch (error) {
        lastError = error as Error;

        // Don't retry if request was aborted
        if (lastError.name === 'AbortError') {
          setState(prev => ({ ...prev, loading: false }));
          return null;
        }

        // Wait before retry (except on last attempt)
        if (attempt < retries) {
          await new Promise(resolve => 
            setTimeout(resolve, retryDelay * Math.pow(2, attempt))
          );
        }
      }
    }

    // All retries failed
    setState({ data: null, loading: false, error: lastError });
    onError?.(lastError);
    showError('Request Failed', lastError.message);
    
    return null;
  }, [defaultOptions, showError]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    cancel,
    reset,
  };
}