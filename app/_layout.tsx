import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import 'react-native-reanimated';
import { Platform, View, Text } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useReducedMotionConfig } from '@/hooks/useReducedMotionConfig';
import { usePerformanceOptimizations } from '@/hooks/usePerformanceOptimizations';
import TouchCapture from '@/components/TouchCapture';
import { useMemoryMonitor } from '@/hooks/useMemoryMonitor';

// Keep the splash screen visible while we fetch resources
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
    // Preload the pixel font
    try {
      const fontPreload = document.createElement('link');
      fontPreload.rel = 'preload';
      fontPreload.as = 'font';
      fontPreload.type = 'font/ttf';
      fontPreload.href = './assets/fonts/pixel/Doto.ttf';
      fontPreload.crossOrigin = 'anonymous';
      document.head.appendChild(fontPreload);
    } catch (e) {
      console.warn('Failed to preload font:', e);
    }
    
    // Add web vitals optimization hints
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = window.location.origin;
    document.head.appendChild(preconnect);
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // Load pixel font
  const [loaded] = useFonts({
    'Doto': Platform.OS === 'web' 
      ? './assets/fonts/pixel/Doto.ttf'
      : require('../assets/fonts/pixel/Doto.ttf'),
  });
  
  // For web platform, implement progressive rendering
  const [isReady, setIsReady] = useState(Platform.OS !== 'web');

  // Handle reduced motion settings
  useReducedMotionConfig();
  
  // Apply performance optimizations
  usePerformanceOptimizations();
  
  // Monitor memory usage
  useMemoryMonitor({
    threshold: 150, // Lower threshold for better performance
    interval: 20000, // Check more frequently
    onHighUsage: () => {
      console.log('Performing additional cleanup due to high memory usage');
      // Perform any app-specific cleanup here
    }
  });

  // Memoize the theme to prevent unnecessary re-renders
  const theme = useMemo(() => 
    colorScheme === 'dark' ? DarkTheme : DefaultTheme, 
    [colorScheme]
  );

  useEffect(() => {
    if (loaded) {
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
  }, [loaded]);

  if (!loaded || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
        <Text style={{ color: '#a4e4a2', fontSize: 18, fontFamily: 'System' }}>Loading resources...</Text>
      </View>
    );
  }

  return (
    <TouchCapture>
      <ThemeProvider value={theme}>
        <Stack screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#a4e4a2',
          headerTitleStyle: {
            fontFamily: 'Doto',
          },
          contentStyle: {
            backgroundColor: '#1a1a1a',
          },
        }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </TouchCapture>
  );
}
