import { useEffect, useRef } from 'react';
import { InteractionManager, Platform } from 'react-native';

/**
 * A hook to monitor and log performance metrics
 */
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef(Date.now());
  const frameCount = useRef(0);
  const lastFpsUpdateTime = useRef(Date.now());

  useEffect(() => {
    // Record initial render time
    const renderTime = Date.now() - renderStartTime.current;
    console.log(`[PERF] ${componentName} - Initial render time: ${renderTime}ms`);

    // Setup FPS counter for web only
    if (Platform.OS === 'web') {
      const fpsInterval = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = currentTime - lastFpsUpdateTime.current;
        if (elapsed > 0) {
          const fps = Math.round((frameCount.current / elapsed) * 1000);
          console.log(`[PERF] ${componentName} - Current FPS: ${fps}`);
          frameCount.current = 0;
          lastFpsUpdateTime.current = currentTime;
        }
      }, 1000);

      // Request animation frame to count frames
      let frameId: number;
      const countFrame = () => {
        frameCount.current++;
        frameId = requestAnimationFrame(countFrame);
      };
      frameId = requestAnimationFrame(countFrame);

      return () => {
        clearInterval(fpsInterval);
        cancelAnimationFrame(frameId);
      };
    }

    // For non-web platforms, use InteractionManager to detect frame drops
    if (Platform.OS !== 'web') {
      const subscription = InteractionManager.createInteractionHandle();
      
      return () => {
        InteractionManager.clearInteractionHandle(subscription);
      };
    }
  }, [componentName]);

  return {
    logRender: (renderName: string) => {
      console.log(`[PERF] ${componentName} - ${renderName} render triggered`);
    }
  };
} 