/**
 * This file exists to fix Metro bundler issues with font resolution
 * It ensures that fonts can be loaded from multiple locations
 * Uses renamed font file with no spaces or parentheses
 */

import { Platform } from 'react-native';

// Map of font names to their file paths with fallbacks
const fontMap = {
  'Digital-Mono': {
    primary: Platform.OS === 'web' 
      ? require('./fonts/digital7mono.ttf') 
      : require('./assets/fonts/digital7mono.ttf'),
    fallback: require('./fonts/digital7mono.ttf')
  }
};

// Helper function to get the correct font file
export function getFont(fontName) {
  if (!fontMap[fontName]) {
    console.warn(`Font "${fontName}" not found in font map`);
    return null;
  }
  
  try {
    return fontMap[fontName].primary;
  } catch (error) {
    console.warn(`Error accessing primary font "${fontName}", using fallback`, error);
    return fontMap[fontName].fallback;
  }
}

// Export the font map for direct access
export default fontMap; 