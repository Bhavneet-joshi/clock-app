import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';

/**
 * Component to provide proper touch event handling for the entire app
 * This helps avoid "Cannot record touch end without a touch start" errors
 */
export default function TouchCapture({ children }: { children: React.ReactNode }) {
  // Only apply fix for web platform
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View 
      style={styles.container}
      onTouchStart={() => {}}
      onTouchMove={() => {}}
      onTouchEnd={() => {}}
      onTouchCancel={() => {}}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
}); 