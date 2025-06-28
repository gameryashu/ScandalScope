import { useState, useCallback } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface AsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retries?: number;
  retryDelay?: number;
}

export function useAsyncOperation<T>(options: AsyncOperationOptions = {}) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (
    operation: () => Promise<T>
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const { retries = 0, retryDelay = 1000, onSuccess, onError } = options;
    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await operation();
        setState({ data: result, loading: false, error: null });
        onSuccess?.(result);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < retries) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        }
      }
    }

    // All retries failed
    setState(prev => ({ 
      ...prev, 
      loading: false, 
      error: lastError 
    }));
    
    onError?.(lastError);
    return null;
  }, [options]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}