import { useEffect, useRef } from 'react';
import { Platform, InteractionManager, Image } from 'react-native';

/**
 * A hook that monitors memory usage and automatically performs cleanup
 * when memory usage exceeds thresholds
 */
export function useMemoryMonitor(options?: {
  threshold?: number; // Memory threshold in MB
  interval?: number; // Check interval in ms
  onHighUsage?: () => void; // Callback when threshold is exceeded
}) {
  const {
    threshold = 200, // 200MB default threshold
    interval = 30000, // 30s default interval
    onHighUsage
  } = options || {};
  
  const memoryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isHighMemoryRef = useRef(false);
  
  useEffect(() => {
    // For web, use the performance.memory API if available
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const webPerformance = (window.performance as any);
      
      if (webPerformance && webPerformance.memory) {
        console.log('Memory monitoring enabled (web)');
        
        // Check memory periodically
        memoryIntervalRef.current = setInterval(() => {
          const memoryInfo = webPerformance.memory;
          const usedMemoryMB = memoryInfo.usedJSHeapSize / (1024 * 1024);
          
          // Log memory usage periodically (debug only)
          if (__DEV__) {
            console.log(`Memory usage: ${Math.round(usedMemoryMB)}MB / ${Math.round(memoryInfo.jsHeapSizeLimit / (1024 * 1024))}MB`);
          }
          
          // Check for high memory usage
          if (usedMemoryMB > threshold) {
            if (!isHighMemoryRef.current) {
              console.warn(`High memory usage detected: ${Math.round(usedMemoryMB)}MB (threshold: ${threshold}MB)`);
              isHighMemoryRef.current = true;
              
              // Execute custom high usage handler
              if (onHighUsage) {
                onHighUsage();
              }
              
              // Try to force garbage collection
              if ((global as any).gc) {
                console.log('Forcing garbage collection...');
                (global as any).gc();
              }
              
              // Clear image caches and other resources
              if (Image && typeof Image.clearMemoryCache === 'function') {
                Image.clearMemoryCache();
              }
              
              // Schedule cleanup after interactions
              InteractionManager.runAfterInteractions(() => {
                // Additional cleanup can go here
                console.log('Performed memory cleanup');
                
                // Reset high memory flag after cleanup
                setTimeout(() => {
                  isHighMemoryRef.current = false;
                }, 10000); // Wait 10s before allowing another cleanup
              });
            }
          } else if (isHighMemoryRef.current && usedMemoryMB < threshold * 0.8) {
            // Memory usage decreased below 80% of threshold
            isHighMemoryRef.current = false;
          }
        }, interval);
      }
    } else if (Platform.OS === 'android' || Platform.OS === 'ios') {
      // For native platforms, we could use native modules to check memory
      // This would require additional native code through a library like react-native-device-info
      console.log('Memory monitoring not fully implemented for native platforms');
    }
    
    return () => {
      if (memoryIntervalRef.current !== null) {
        clearInterval(memoryIntervalRef.current);
      }
    };
  }, [threshold, interval, onHighUsage]);
}

// For TypeScript support
declare global {
  interface Window {
    performance: Performance & {
      memory?: {
        usedJSHeapSize: number;
        jsHeapSizeLimit: number;
        totalJSHeapSize: number;
      };
    };
  }
} 