import { useEffect } from 'react';
import { InteractionManager, Platform } from 'react-native';

/**
 * Custom hook to apply various performance optimizations
 */
export function usePerformanceOptimizations() {
  useEffect(() => {
    // Defer non-critical operations until after interactions
    const task = InteractionManager.runAfterInteractions(() => {
      // Any heavy initialization can go here
      console.log('Performance optimizations applied');
    });

    // Apply platform-specific optimizations
    if (Platform.OS === 'web') {
      // Web-specific optimizations
      if (typeof window !== 'undefined') {
        // Disable some expensive browser features in development
        if (__DEV__) {
          // Reduce console noise
          const originalConsoleWarn = console.warn;
          console.warn = (...args) => {
            // Filter out common warnings that don't affect functionality
            const warningText = args[0]?.toString() || '';
            if (
              warningText.includes('Animated:') ||
              warningText.includes('componentWillReceiveProps') ||
              warningText.includes('componentWillMount')
            ) {
              return;
            }
            originalConsoleWarn(...args);
          };
        }

        // Filter touch event errors regardless of dev/prod mode
        const originalConsoleError = console.error;
        console.error = (...args) => {
          // Filter out touch event errors that are common in React Native Web
          const errorText = args[0]?.toString() || '';
          if (
            errorText.includes('Cannot record touch end without a touch start') ||
            errorText.includes('Cannot record touch move without a touch start')
          ) {
            return;
          }
          originalConsoleError(...args);
        };

        // Apply production-specific optimizations
        if (!__DEV__) {
          // Disable debug logging in production
          console.debug = () => {};
          
          // Add passive event listeners when possible for better touch performance
          try {
            // Test via a getter in the options object to see if passive is supported
            let supportsPassive = false;
            const opts = Object.defineProperty({}, 'passive', {
              get: function() {
                supportsPassive = true;
                return true;
              }
            });
            window.addEventListener('testPassive', null, opts);
            window.removeEventListener('testPassive', null, opts);
            
            if (supportsPassive) {
              const passiveOption = { passive: true };
              // Use passive listeners for common scroll/touch events
              document.addEventListener('touchstart', () => {}, passiveOption);
              document.addEventListener('touchmove', () => {}, passiveOption);
              document.addEventListener('wheel', () => {}, passiveOption);
            }
          } catch (e) {
            // Do nothing if error occurs
          }
          
          // Optimize image loading for web
          if ('loading' in HTMLImageElement.prototype) {
            document.querySelectorAll('img').forEach(img => {
              img.loading = 'lazy';
            });
          }
          
          // Optimize DOM mutation
          // This helps with React's frequent DOM updates
          if (typeof window.requestAnimationFrame !== 'undefined') {
            // Use a more efficient rendering cycle
            let pendingRenders = [];
            let isRenderScheduled = false;
            
            const batchRenders = () => {
              const renders = pendingRenders;
              pendingRenders = [];
              isRenderScheduled = false;
              
              // Process all scheduled renders
              renders.forEach(callback => callback());
            };
            
            // Override requestAnimationFrame for more efficient batching
            const originalRequestAnimationFrame = window.requestAnimationFrame;
            window.requestAnimationFrame = (callback) => {
              pendingRenders.push(callback);
              
              if (!isRenderScheduled) {
                isRenderScheduled = true;
                originalRequestAnimationFrame(batchRenders);
              }
              
              // Return a dummy ID
              return 0;
            };
          }
        }
      }
    }

    return () => {
      // Clean up any performance-related tasks
      task.cancel();
    };
  }, []);
} 