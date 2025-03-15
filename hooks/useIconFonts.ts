import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

export default function useIconFonts() {
  const [iconFontsLoaded, setIconFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadIconFonts() {
      try {
        // Load icon fonts from our local files rather than relying on the library's font property
        await Font.loadAsync({
          // Explicitly load the icon font files we copied to our assets
          'Ionicons': require('../assets/fonts/vector-icons/Ionicons.ttf'),
          'Material Icons': require('../assets/fonts/vector-icons/MaterialIcons.ttf'),
          'FontAwesome': require('../assets/fonts/vector-icons/FontAwesome.ttf'),
        });
        
        setIconFontsLoaded(true);
      } catch (error) {
        console.error('Error loading custom icon fonts:', error);
        
        // Fallback to the default font loading mechanism
        try {
          await Font.loadAsync({
            ...Ionicons.font,
            ...MaterialIcons.font,
            ...FontAwesome.font,
          });
          
          setIconFontsLoaded(true);
        } catch (fallbackError) {
          console.error('Error loading default icon fonts:', fallbackError);
        }
      }
    }

    loadIconFonts();
  }, []);

  return iconFontsLoaded;
} 