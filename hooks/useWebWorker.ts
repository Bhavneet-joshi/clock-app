import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

/**
 * A hook that provides a way to run heavy calculations in a separate thread
 * using Web Workers on web, and a fallback for native platforms
 */
export function useWebWorker<T, R>(
  workerFunction: (data: T) => R,
  dependencies: any[] = []
) {
  const workerRef = useRef<Worker | null>(null);
  const [result, setResult] = useState<R | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Create worker on mount
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Worker' in window) {
      try {
        // Create a worker from a blob URL
        const workerCode = `
          self.onmessage = function(e) {
            try {
              const result = (${workerFunction.toString()})(e.data);
              self.postMessage({ success: true, result });
            } catch (error) {
              self.postMessage({ success: false, error: error.message });
            }
          }
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        workerRef.current = new Worker(url);
        
        // Set up message handler
        workerRef.current.onmessage = (e) => {
          if (e.data.success) {
            setResult(e.data.result);
          } else {
            setError(new Error(e.data.error));
          }
          setIsProcessing(false);
        };
        
        // Set up error handler
        workerRef.current.onerror = (e) => {
          setError(new Error('Worker error: ' + e.message));
          setIsProcessing(false);
        };
        
        // Clean up blob URL
        return () => {
          if (workerRef.current) {
            workerRef.current.terminate();
            URL.revokeObjectURL(url);
          }
        };
      } catch (error) {
        console.warn('Failed to create web worker:', error);
        // Continue with fallback
      }
    }
  }, dependencies);
  
  // Function to run calculations
  const compute = async (data: T): Promise<R> => {
    setIsProcessing(true);
    setError(null);
    
    // Use the worker if available
    if (workerRef.current) {
      workerRef.current.postMessage(data);
      return new Promise((resolve, reject) => {
        const handler = (e: MessageEvent) => {
          workerRef.current?.removeEventListener('message', handler);
          if (e.data.success) {
            resolve(e.data.result);
          } else {
            reject(new Error(e.data.error));
          }
        };
        workerRef.current?.addEventListener('message', handler);
      });
    } 
    
    // Fallback to main thread
    try {
      const calculatedResult = workerFunction(data);
      setResult(calculatedResult);
      setIsProcessing(false);
      return calculatedResult;
    } catch (err) {
      setError(err as Error);
      setIsProcessing(false);
      throw err;
    }
  };
  
  return { compute, result, error, isProcessing };
} 