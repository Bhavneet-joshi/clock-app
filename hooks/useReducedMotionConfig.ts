import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Custom hook to handle reduced motion settings
 * This is a workaround for the warning about reduced motion settings
 * since setDefaultReduceMotion is not available in the current version
 */
export function useReducedMotionConfig() {
  useEffect(() => {
    // This is just to acknowledge the warning in development
    // In a real app, you might want to check the user's accessibility settings
    // and adjust animations accordingly
    if (__DEV__ && Platform.OS === 'web') {
      console.log('Note: Reduced motion warning is only shown in development mode');
      console.log('You can safely ignore this warning or implement custom handling for reduced motion');
    }
  }, []);
} 