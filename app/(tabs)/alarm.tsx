import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, StatusBar, ScrollView, Alert, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Font from 'expo-font';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { useAsyncStorageCache } from '../../hooks/useAsyncStorageCache';
import VirtualizedList from '../../components/VirtualizedList';

const { width, height } = Dimensions.get('window');

const INITIAL_HOUR = new Date().getHours().toString().padStart(2, '0');
const INITIAL_MINUTE = new Date().getMinutes().toString().padStart(2, '0');

export default function AlarmScreen() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showColons, setShowColons] = useState(true);
  const [selectedTime, setSelectedTime] = useState({ hour: INITIAL_HOUR, minute: INITIAL_MINUTE });
  const [activeDays, setActiveDays] = useState([false, false, false, true, false, false, false]);
  const [alarmSound, setAlarmSound] = useState('WAKE UP');
  const [snoozeTime, setSnoozeTime] = useState('EVERY 10 MIN');
  const [repeatOption, setRepeatOption] = useState('NO');
  const [alarmLabel, setAlarmLabel] = useState('NEW ALARM');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);

  // Add performance monitoring
  const perf = usePerformanceMonitor('AlarmScreen');

  // Load custom fonts with better error handling
  useEffect(() => {
    async function loadFonts() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load both custom fonts and Ionicons in parallel for better performance
        await Promise.all([
          Font.loadAsync({
            'digital-mono': require('../../assets/fonts/digital7mono.ttf'),
          }),
          Font.loadAsync(Ionicons.font)
        ]);
        
        console.log('All fonts and icons loaded successfully');
        setFontsLoaded(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading fonts:', error);
        
        // Try loading separately to identify which one failed
        try {
          // First try loading Ionicons
          await Font.loadAsync(Ionicons.font);
          console.log('Ionicons loaded successfully');
          
          // Then try loading custom font with fallback paths
          await Font.loadAsync({
            'digital-mono': Platform.OS === 'web' 
              ? require('../../fonts/digital7mono.ttf')
              : require('../../assets/fonts/digital7mono.ttf'),
          });
          
          console.log('Fonts loaded successfully from fallback');
          setFontsLoaded(true);
        } catch (fallbackError) {
          console.error('Failed to load fonts from fallback:', fallbackError);
          setError('Failed to load fonts. Please check your internet connection and try again.');
        }
        setIsLoading(false);
      }
    }
    
    loadFonts();

    return () => {
      setFontsLoaded(false);
      setIsLoading(false);
      setError(null);
    };
  }, []);

  // Generate hours and minutes for the time picker wheels
  const hours = useMemo(() => {
    const result = [];
    for (let i = 0; i < 24; i++) {
      result.push(i.toString().padStart(2, '0'));
    }
    return result;
  }, []);

  const minutes = useMemo(() => {
    const result = [];
    for (let i = 0; i < 60; i++) {
      result.push(i.toString().padStart(2, '0'));
    }
    return result;
  }, []);

  // Show loading screen with better visibility and fallback icons
  if (isLoading || !fontsLoaded) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#a4e4a2" />
        <Text style={[styles.loadingText, { 
          fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
          marginTop: 10 
        }]}>
          Loading...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={[styles.errorText, { fontFamily: Platform.OS === 'web' ? 'monospace' : undefined }]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setIsLoading(true);
            setError(null);
            loadFonts();
          }}
        >
          <Text style={[styles.retryButtonText, { fontFamily: Platform.OS === 'web' ? 'monospace' : undefined }]}>
            RETRY
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setShowColons(prev => !prev);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle day selection
  const toggleDay = useCallback((day, index) => {
    setActiveDays(prev => {
      const newDays = [...prev];
      newDays[index] = !newDays[index];
      return newDays;
    });
  }, []);

  // Cycle through sound options
  const cycleSound = useCallback(() => {
    const sounds = ['WAKE UP', 'BEEP', 'CHIME', 'DIGITAL'];
    setAlarmSound(prev => {
      const currentIndex = sounds.indexOf(prev);
      const nextIndex = (currentIndex + 1) % sounds.length;
      return sounds[nextIndex];
    });
  }, []);

  // Cycle through snooze options
  const cycleSnooze = useCallback(() => {
    const options = ['EVERY 5 MIN', 'EVERY 10 MIN', 'EVERY 15 MIN', 'NO'];
    setSnoozeTime(prev => {
      const currentIndex = options.indexOf(prev);
      const nextIndex = (currentIndex + 1) % options.length;
      return options[nextIndex];
    });
  }, []);

  // Cycle through repeat options
  const cycleRepeat = useCallback(() => {
    const options = ['DAILY', 'WEEKDAYS', 'WEEKENDS', 'NO'];
    setRepeatOption(prev => {
      const currentIndex = options.indexOf(prev);
      const nextIndex = (currentIndex + 1) % options.length;
      return options[nextIndex];
    });
  }, []);

  // Save alarm
  const { data: existingAlarms, saveData: saveAlarms } = useAsyncStorageCache('alarms', []);

  const saveAlarm = useCallback(async () => {
    try {
      perf.logRender('saveAlarm');
      console.log("Saving alarm with time:", `${selectedTime.hour}:${selectedTime.minute}`);
      
      // Create new alarm object
      const newAlarm = {
        id: Date.now().toString(),
        time: `${selectedTime.hour}:${selectedTime.minute}`,
        days: activeDays,
        sound: alarmSound,
        snoozeTime: snoozeTime,
        repeatOption: repeatOption,
        label: alarmLabel,
        isActive: true,
        createdAt: Date.now() // Add timestamp for sorting by recency
      };
      
      // Log the new alarm object
      console.log("New alarm object:", JSON.stringify(newAlarm));
      
      // Use cached alarms instead of direct AsyncStorage access
      let updatedAlarms = [];
      
      if (existingAlarms && Array.isArray(existingAlarms)) {
        updatedAlarms = [...existingAlarms, newAlarm];
      } else {
        updatedAlarms = [newAlarm];
      }
      
      // Save updated alarms with our optimized storage hook
      await saveAlarms(updatedAlarms);
      console.log("Successfully saved", updatedAlarms.length, "alarms");
      
      // Reset form
      setActiveDays([false, false, false, true, false, false, false]);
      setAlarmSound('WAKE UP');
      setSnoozeTime('EVERY 10 MIN');
      setRepeatOption('NO');
      setAlarmLabel('NEW ALARM');
      
      // Show success message and navigate back to home
      Alert.alert('Success', 'Alarm saved successfully!', [
        { 
          text: 'OK', 
          onPress: () => router.push('/(tabs)') 
        }
      ]);
    } catch (error) {
      console.error('Error saving alarm:', error);
      // Show more detailed error message to help diagnose the issue
      Alert.alert(
        'Error', 
        `Failed to save alarm: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
      );
    }
  }, [selectedTime, activeDays, alarmSound, snoozeTime, repeatOption, alarmLabel, router, existingAlarms, saveAlarms]);

  // Format time as HH:MM
  const formatTime = useCallback((date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return showColons ? `${hours}:${minutes}` : `${hours} ${minutes}`;
  }, [showColons]);

  // Render day buttons
  const renderDayButtons = useMemo(() => {
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    return (
      <View style={styles.daysContainer}>
        {days.map((day, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => toggleDay(day, index)}
            style={[
              styles.dayButton,
              activeDays[index] && styles.activeDayButton
            ]}
          >
            <Text 
              style={[
                styles.dayText, 
                activeDays[index] && styles.activeDayText
              ]}
            >
              {day.charAt(0)}
            </Text>
          </TouchableOpacity>
        ))}
        </View>
    );
  }, [activeDays, toggleDay]);

  // Memoize the hour item renderer to prevent recreating it on each render
  const renderHourItem = useCallback(({ item, index }) => {
    const isSelected = item === selectedTime.hour;
    
    return (
      <TouchableOpacity
        style={[
          styles.timeWheelItem,
          isSelected && styles.selectedTimeWheelItem
        ]}
        onPress={() => {
          setSelectedTime(prev => ({ ...prev, hour: item }));
          hourListRef.current?.scrollToIndex({ 
            index, 
            animated: true,
            viewPosition: 0.5
          });
        }}
      >
        <Text 
          style={[
            styles.timeWheelText,
            isSelected ? styles.selectedTimeWheelText : styles.dimmedTimeWheelText
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedTime.hour]);

  // Memoize the minute item renderer
  const renderMinuteItem = useCallback(({ item, index }) => {
    const isSelected = item === selectedTime.minute;
    
    return (
      <TouchableOpacity
        style={[
          styles.timeWheelItem,
          isSelected && styles.selectedTimeWheelItem
        ]}
        onPress={() => {
          setSelectedTime(prev => ({ ...prev, minute: item }));
          minuteListRef.current?.scrollToIndex({ 
            index, 
            animated: true,
            viewPosition: 0.5
          });
        }}
      >
        <Text 
          style={[
            styles.timeWheelText,
            isSelected ? styles.selectedTimeWheelText : styles.dimmedTimeWheelText
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedTime.minute]);

  // Memoize the getItemLayout functions for better performance
  const getHourItemLayout = useCallback((data, index) => ({
    length: 60,
    offset: 60 * index,
    index,
  }), []);

  const getMinuteItemLayout = useCallback((data, index) => ({
    length: 60,
    offset: 60 * index,
    index,
  }), []);

  // Handle scroll end for hours
  const handleHourScrollEnd = useCallback((event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / 60);
    const hour = hours[index];
    if (hour) {
      setSelectedTime(prev => ({ ...prev, hour }));
    }
  }, [hours]);

  // Handle scroll end for minutes
  const handleMinuteScrollEnd = useCallback((event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / 60);
    const minute = minutes[index];
    if (minute) {
      setSelectedTime(prev => ({ ...prev, minute }));
    }
  }, [minutes]);

  // Render time picker wheels
  const renderTimePicker = useMemo(() => {
    return (
      <View style={styles.timePickerContainer}>
        <VirtualizedList
          ref={hourListRef}
          data={hours}
          renderItem={renderHourItem}
          keyExtractor={(item) => item}
          getItemLayout={getHourItemLayout}
          showsVerticalScrollIndicator={false}
          snapToInterval={60}
          decelerationRate="fast"
          onMomentumScrollEnd={handleHourScrollEnd}
          initialScrollIndex={hours.indexOf(selectedTime.hour)}
          style={styles.timeWheel}
          contentContainerStyle={styles.timeWheelContent}
          ListHeaderComponent={<View style={styles.timeWheelPadding} />}
          ListFooterComponent={<View style={styles.timeWheelPadding} />}
          onScrollToIndexFailed={(info) => {
            console.warn('Failed to scroll to hour index:', info);
          }}
        />
        <Text style={styles.timeWheelSeparator}>:</Text>
        <VirtualizedList
          ref={minuteListRef}
          data={minutes}
          renderItem={renderMinuteItem}
          keyExtractor={(item) => item}
          getItemLayout={getMinuteItemLayout}
          showsVerticalScrollIndicator={false}
          snapToInterval={60}
          decelerationRate="fast"
          onMomentumScrollEnd={handleMinuteScrollEnd}
          initialScrollIndex={minutes.indexOf(selectedTime.minute)}
          style={styles.timeWheel}
          contentContainerStyle={styles.timeWheelContent}
          ListHeaderComponent={<View style={styles.timeWheelPadding} />}
          ListFooterComponent={<View style={styles.timeWheelPadding} />}
          onScrollToIndexFailed={(info) => {
            console.warn('Failed to scroll to minute index:', info);
          }}
        />
      </View>
    );
  }, [hours, minutes, selectedTime, renderHourItem, renderMinuteItem]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Status bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>{formatTime(currentTime)}</Text>
        <View style={styles.battery}>
          <Text style={styles.signal}>●●●●</Text>
          <Text style={styles.wifi}>▲</Text>
          <Text style={styles.batt}>■</Text>
        </View>
      </View>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SET ALARM</Text>
      </View>
      
      {/* Time picker wheels */}
      {renderTimePicker}
      
      {/* Current selected time display */}
      <View style={styles.selectedTimeContainer}>
        <Text style={styles.selectedTimeText}>
          {selectedTime.hour}:{selectedTime.minute}
        </Text>
      </View>
      
      {/* Day selection */}
      <Text style={styles.sectionTitle}>REPEAT ON</Text>
      {renderDayButtons}
      
      {/* Function buttons */}
      <View style={styles.functionContainer}>
        <View style={styles.functionButtonGroup}>
          <TouchableOpacity style={styles.functionIconButton} onPress={cycleSound}>
            <Ionicons 
              name="musical-note-outline" 
              size={24} 
              color="#a4e4a2" 
              style={styles.functionIcon}
            />
          </TouchableOpacity>
          <View style={styles.functionTextContainer}>
            <Text style={styles.functionTitle}>SOUND</Text>
            <Text style={styles.functionValue}>{alarmSound}</Text>
          </View>
        </View>
        
        <View style={styles.functionButtonGroup}>
          <TouchableOpacity style={styles.functionIconButton} onPress={cycleSnooze}>
            <Ionicons 
              name="alarm-outline" 
              size={24} 
              color="#a4e4a2" 
              style={styles.functionIcon}
            />
          </TouchableOpacity>
          <View style={styles.functionTextContainer}>
            <Text style={styles.functionTitle}>SNOOZE</Text>
            <Text style={styles.functionValue}>{snoozeTime}</Text>
          </View>
        </View>
        
        <View style={styles.functionButtonGroup}>
          <TouchableOpacity style={styles.functionIconButton} onPress={cycleRepeat}>
            <Ionicons 
              name="repeat-outline" 
              size={24} 
              color="#a4e4a2" 
              style={styles.functionIcon}
            />
          </TouchableOpacity>
          <View style={styles.functionTextContainer}>
            <Text style={styles.functionTitle}>REPEAT</Text>
            <Text style={styles.functionValue}>{repeatOption}</Text>
          </View>
        </View>
      </View>
      
      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Ionicons 
            name="close" 
            size={24} 
            color="#a4e4a2" 
            style={styles.functionIcon}
          />
        </TouchableOpacity>
        
        <Text style={styles.controlsText}>CHOOSE TIME</Text>
        
        <TouchableOpacity style={styles.confirmButton} onPress={saveAlarm}>
          <Ionicons 
            name="checkmark" 
            size={24} 
            color="#000" 
            style={styles.functionIcon}
          />
        </TouchableOpacity>
      </View>
      
      {/* Home bar */}
      <View style={styles.homeBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  loadingText: {
    color: '#a4e4a2',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    fontFamily: 'digital-mono',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusTime: {
    color: '#a4e4a2',
    fontFamily: 'digital-mono',
    fontSize: 14,
  },
  battery: {
    flexDirection: 'row',
  },
  signal: {
    color: '#a4e4a2',
    marginRight: 5,
    fontSize: 10,
    fontFamily: 'digital-mono',
  },
  wifi: {
    color: '#a4e4a2',
    marginRight: 5,
    fontSize: 10,
    fontFamily: 'digital-mono',
  },
  batt: {
    color: '#a4e4a2',
    fontSize: 10,
    fontFamily: 'digital-mono',
  },
  header: {
    marginBottom: 30,
  },
  headerTitle: {
    color: '#a4e4a2',
    fontSize: 24,
    fontFamily: 'digital-mono',
    letterSpacing: 2,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 180,
    marginVertical: 20,
  },
  timeWheel: {
    height: 180,
    width: 80,
  },
  timeWheelContent: {
    paddingVertical: 60,
  },
  timeWheelPadding: {
    height: 60,
  },
  timeWheelItem: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTimeWheelItem: {
    backgroundColor: 'rgba(164, 228, 162, 0.1)',
  },
  timeWheelText: {
    fontFamily: Platform.select({ web: 'monospace', default: 'digital-mono' }),
    fontSize: 24,
    color: '#666',
  },
  selectedTimeWheelText: {
    color: '#a4e4a2',
    fontSize: 32,
  },
  dimmedTimeWheelText: {
    color: '#666',
  },
  timeWheelSeparator: {
    fontFamily: Platform.select({ web: 'monospace', default: 'digital-mono' }),
    fontSize: 32,
    color: '#a4e4a2',
    marginHorizontal: 10,
  },
  selectedTimeContainer: {
    backgroundColor: 'rgba(164, 228, 162, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    width: '80%',
  },
  selectedTimeText: {
    color: '#a4e4a2',
    fontSize: 42,
    fontFamily: 'digital-mono',
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#a4e4a2',
    fontSize: 16,
    fontFamily: 'digital-mono',
    marginBottom: 10,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(164, 228, 162, 0.3)',
  },
  activeDayButton: {
    backgroundColor: 'rgba(164, 228, 162, 0.2)',
    borderColor: '#a4e4a2',
  },
  dayText: {
    color: 'rgba(164, 228, 162, 0.5)',
    fontSize: 16,
    fontFamily: 'digital-mono',
  },
  activeDayText: {
    color: '#a4e4a2',
  },
  functionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  functionButtonGroup: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '33%',
  },
  functionIconButton: {
    marginBottom: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(164, 228, 162, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  functionIcon: {
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  functionTextContainer: {
    alignItems: 'center',
  },
  functionTitle: {
    color: '#a4e4a2',
    fontSize: 14,
    fontFamily: 'digital-mono',
    marginBottom: 5,
  },
  functionValue: {
    color: '#a4e4a2',
    fontSize: 12,
    fontFamily: 'digital-mono',
    opacity: 0.7,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  cancelButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(164, 228, 162, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  confirmButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#a4e4a2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  controlsText: {
    color: '#a4e4a2',
    fontSize: 14,
    fontFamily: 'digital-mono',
  },
  homeBar: {
    width: 100,
    height: 5,
    backgroundColor: '#a4e4a2',
    borderRadius: 2.5,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#a4e4a2',
    fontSize: 18,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#a4e4a2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 