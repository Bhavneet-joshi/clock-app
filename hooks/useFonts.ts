import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { Platform } from 'react-native';

export default function useFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        // Use the renamed font file with no spaces or parentheses
        await Font.loadAsync({
          'Digital-Mono': Platform.OS === 'web' 
            ? require('../fonts/digital7mono.ttf') 
            : require('../assets/fonts/digital7mono.ttf'),
        });
        
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts from primary location:', error);
        
        // Try alternate paths as a fallback
        try {
          await Font.loadAsync({
            'Digital-Mono': require('../fonts/digital7mono.ttf'),
          });
          
          setFontsLoaded(true);
        } catch (secondError) {
          console.error('Error loading fonts from fallback location:', secondError);
          
          // Try a third attempt with the original filename if needed
          try {
            await Font.loadAsync({
              'Digital-Mono': Platform.OS === 'web'
                ? require('../fonts/digital-7 (mono).ttf')
                : require('../assets/fonts/digital-7 (mono).ttf'),
            });
            
            setFontsLoaded(true);
          } catch (thirdError) {
            console.error('All font loading attempts failed:', thirdError);
          }
        }
      }
    }

    loadFonts();
  }, []);

  return fontsLoaded;
} 