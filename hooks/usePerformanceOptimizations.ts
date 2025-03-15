import { useEffect } from 'react';
import { Platform, InteractionManager, UIManager } from 'react-native';

/**
 * A hook that applies various performance optimizations
 * for React Native applications, with special handling for web.
 */
export function usePerformanceOptimizations() {
  useEffect(() => {
    console.log("Applying performance optimizations");

    // Error filtering to reduce console noise
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Store original console methods
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;

      // Filter out non-critical errors and warnings to reduce CPU overhead
      console.error = (...args: any[]) => {
        const errorMessage = args.length > 0 ? String(args[0]) : '';
        
        // Skip common React Native web warnings that aren't critical
        if (
          errorMessage.includes('shadow') || 
          errorMessage.includes('pointerEvents') ||
          errorMessage.includes('Cannot record touch') ||
          errorMessage.includes('TouchBank')
        ) {
          // Silently ignore these errors in production
          if (process.env.NODE_ENV !== 'production') {
            // In development, log them as warnings instead
            console.warn('[Filtered Error]:', ...args);
          }
          return;
        }
        
        // Pass through other errors
        originalConsoleError.apply(console, args);
      };

      // Filter common warnings
      console.warn = (...args: any[]) => {
        const warnMessage = args.length > 0 ? String(args[0]) : '';
        
        // Skip common RN warnings
        if (
          warnMessage.includes('Reanimated') ||
          warnMessage.includes('motion') ||
          warnMessage.includes('preloaded') 
        ) {
          // Completely skip in production
          if (process.env.NODE_ENV !== 'production') {
            // In development, log with prefix for clarity
            originalConsoleWarn.call(console, '[Low Priority]', ...args);
          }
          return;
        }
        
        // Pass through other warnings
        originalConsoleWarn.apply(console, args);
      };

      // Clean up on unmount
      return () => {
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
      };
    }

    // Enable layout animation on Android
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    // Optimize interaction batching for native platforms
    if (Platform.OS !== 'web') {
      // Schedule heavy computations to happen after interactions
      const handle = InteractionManager.createInteractionHandle();
      
      // Clear after component mounts fully
      setTimeout(() => {
        InteractionManager.clearInteractionHandle(handle);
      }, 500);
    }

    // Web-specific optimizations
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Optimize animations and transitions
      const style = document.createElement('style');
      style.innerHTML = `
        /* Performance optimizations for animations */
        * {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          -moz-backface-visibility: hidden;
        }
        
        /* Force hardware acceleration for specific elements */
        .rn-text, .rn-view {
          transform: translateZ(0);
          will-change: transform;
        }
        
        /* Optimize repaints */
        body {
          overscroll-behavior: none;
        }
      `;
      document.head.appendChild(style);
      
      // Enhanced RAM usage management for longer app sessions
      if ('memory' in window.performance) {
        // Check memory usage periodically
        const memoryInterval = setInterval(() => {
          const memoryInfo = (performance as any).memory;
          if (memoryInfo && memoryInfo.usedJSHeapSize > 200000000) { // 200MB
            console.log('High memory usage detected, optimizing...');
            
            // Force garbage collection if possible (works in some browsers)
            if (global.gc) {
              global.gc();
            }
          }
        }, 30000); // Check every 30 seconds
        
        return () => clearInterval(memoryInterval);
      }
    }
    
    // Apply additional performance optimizations based on the platform
    console.log("Performance optimizations applied");
  }, []);
} 