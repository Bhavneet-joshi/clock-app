import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LCDColors } from '@/constants/LCDStyles';

const { width, height } = Dimensions.get('window');

// Calculate number of grid lines based on screen dimensions
const GRID_SIZE = 20; // Size of each grid cell in pixels
const HORIZONTAL_LINES = Math.floor(height / GRID_SIZE);
const VERTICAL_LINES = Math.floor(width / GRID_SIZE);

const GridBackground = () => {
  return (
    <View style={styles.container}>
      {/* Horizontal lines */}
      {Array.from({ length: HORIZONTAL_LINES }).map((_, index) => (
        <View 
          key={`h-${index}`} 
          style={[
            styles.horizontalLine, 
            { top: index * GRID_SIZE }
          ]} 
        />
      ))}
      
      {/* Vertical lines */}
      {Array.from({ length: VERTICAL_LINES }).map((_, index) => (
        <View 
          key={`v-${index}`} 
          style={[
            styles.verticalLine, 
            { left: index * GRID_SIZE }
          ]} 
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  horizontalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: LCDColors.gridLines,
  },
  verticalLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: LCDColors.gridLines,
  },
});

export default GridBackground; 