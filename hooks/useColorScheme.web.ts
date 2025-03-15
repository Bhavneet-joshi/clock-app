import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  // Use a ref to track if we're mounted to avoid state updates before mounting
  const [hasHydrated, setHasHydrated] = useState(false);
  const colorScheme = useRNColorScheme();

  // Move state update to useEffect to ensure it happens after mounting
  useEffect(() => {
    // This ensures we only set state after the component has mounted
    const timeout = setTimeout(() => {
      setHasHydrated(true);
    }, 0);
    
    return () => clearTimeout(timeout);
  }, []);

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
