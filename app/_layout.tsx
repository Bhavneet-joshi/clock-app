import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import 'react-native-reanimated';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useReducedMotionConfig } from '@/hooks/useReducedMotionConfig';
import { usePerformanceOptimizations } from '@/hooks/usePerformanceOptimizations';
import useIconFonts from '@/hooks/useIconFonts';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Optimize performance for web platform
if (Platform.OS === 'web') {
  // Increase JS thread priority for web
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    // @ts-ignore
    window.requestIdleCallback = null;
  }
  
  // Add high priority preloads for critical assets
  if (typeof document !== 'undefined' && document.head) {
    // Try multiple possible font paths for preloading - using the renamed font file
    const fontPaths = [
      './assets/fonts/digital7mono.ttf',
      './fonts/digital7mono.ttf',
    ];
    
    // Create preload links for each possible path
    fontPaths.forEach(path => {
      try {
        const fontPreload = document.createElement('link');
        fontPreload.rel = 'preload';
        fontPreload.as = 'font';
        fontPreload.type = 'font/ttf';
        fontPreload.href = path;
        fontPreload.crossOrigin = 'anonymous';
        document.head.appendChild(fontPreload);
      } catch (e) {
        // Silently fail if we can't add a preload
      }
    });
    
    // Add web vitals optimization hints
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = window.location.origin;
    document.head.appendChild(preconnect);
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // Load digital fonts
  const [loaded] = useFonts({
    'Digital-Mono': Platform.OS === 'web' 
      ? require('../fonts/digital7mono.ttf') 
      : require('../assets/fonts/digital7mono.ttf'),
  });
  
  // Load icon fonts using our specialized hook
  const iconFontsLoaded = useIconFonts();
  
  // For web platform, implement progressive rendering
  const [isReady, setIsReady] = useState(Platform.OS !== 'web');

  // Handle reduced motion settings
  useReducedMotionConfig();
  
  // Apply performance optimizations
  usePerformanceOptimizations();

  // Memoize the theme to prevent unnecessary re-renders
  const theme = useMemo(() => 
    colorScheme === 'dark' ? DarkTheme : DefaultTheme, 
    [colorScheme]
  );

  useEffect(() => {
    if (loaded && iconFontsLoaded) {
      // Set a minimum delay for web to ensure UI is ready
      if (Platform.OS === 'web') {
        // Use requestAnimationFrame for smoother rendering
        const frame = requestAnimationFrame(() => {
          // Delay just slightly to allow the browser to paint
          setTimeout(() => {
            SplashScreen.hideAsync();
            setIsReady(true);
          }, 50);
        });
        return () => cancelAnimationFrame(frame);
      } else {
        SplashScreen.hideAsync();
      }
    }
  }, [loaded, iconFontsLoaded]);

  if (!loaded || !iconFontsLoaded || !isReady) {
    return null;
  }

  return (
    <ThemeProvider value={theme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
