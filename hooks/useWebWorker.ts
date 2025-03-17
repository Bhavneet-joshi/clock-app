import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';

/**
 * A hook that provides a way to run heavy calculations in a separate thread
 * using Web Workers on web, and a fallback for native platforms
 */
interface WebWorkerOptions {
  timeout?: number;
  onError?: (error: Error) => void;
}

export function useWebWorker<T, R>(
  workerPath: string | null,
  options: WebWorkerOptions = {}
) {
  const workerRef = useRef<Worker | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const compute = useCallback(async (data: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      if (Platform.OS !== 'web' || !workerPath) {
        // For non-web platforms or when worker path is not provided,
        // execute the function synchronously
        try {
          const result = (data as any).workerFunction(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
        return;
      }

      cleanup();

      try {
        workerRef.current = new Worker(workerPath);
        setIsProcessing(true);

        const handleMessage = (event: MessageEvent) => {
          cleanup();
          setIsProcessing(false);
          resolve(event.data);
        };

        const handleError = (error: ErrorEvent) => {
          cleanup();
          setIsProcessing(false);
          if (options.onError) {
            options.onError(error.error);
          } else {
            reject(error.error);
          }
        };

        workerRef.current.addEventListener('message', handleMessage);
        workerRef.current.addEventListener('error', handleError);

        // Set timeout if specified
        if (options.timeout) {
          timeoutRef.current = setTimeout(() => {
            cleanup();
            setIsProcessing(false);
            reject(new Error(`Worker timed out after ${options.timeout}ms`));
          }, options.timeout);
        }

        workerRef.current.postMessage(data);
      } catch (error) {
        cleanup();
        setIsProcessing(false);
        if (options.onError) {
          options.onError(error as Error);
        } else {
          reject(error);
        }
      }
    });
  }, [workerPath, options, cleanup]);

  return {
    compute,
    isProcessing,
    cleanup
  };
} 