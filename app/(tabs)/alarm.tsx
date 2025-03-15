import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, StatusBar, ScrollView, Alert, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Font from 'expo-font';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

const { width, height } = Dimensions.get('window');

export default function AlarmScreen() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showColons, setShowColons] = useState(true);
  const [selectedTime, setSelectedTime] = useState({ hour: '09', minute: '50' });
  const [activeDays, setActiveDays] = useState([false, false, false, true, false, false, false]);
  const [alarmSound, setAlarmSound] = useState('WAKE UP');
  const [snoozeTime, setSnoozeTime] = useState('EVERY 10 MIN');
  const [repeatOption, setRepeatOption] = useState('NO');
  const [alarmLabel, setAlarmLabel] = useState('NEW ALARM');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);

  // Add performance monitoring
  const perf = usePerformanceMonitor('AlarmScreen');

  // Load custom fonts
  useEffect(() => {
    async function loadFonts() {
      try {
        // Use renamed font file with no spaces or parentheses
        await Font.loadAsync({
          'digital-mono': Platform.OS === 'web'
            ? require('../../fonts/digital7mono.ttf')
            : require('../../assets/fonts/digital7mono.ttf'),
          // Also load Ionicons
          ...Ionicons.font,
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts from primary location, trying fallback:', error);
        // Try fallback with renamed file
        try {
          await Font.loadAsync({
            'digital-mono': require('../../fonts/digital7mono.ttf'),
            // Also load Ionicons in fallback
            ...Ionicons.font,
          });
          setFontsLoaded(true);
        } catch (fallbackError) {
          console.error('Failed to load fonts from fallback location:', fallbackError);
        }
      }
    }
    loadFonts();
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
  const saveAlarm = useCallback(async () => {
    try {
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
      
      // Get existing alarms
      const existingAlarmsJson = await AsyncStorage.getItem('alarms');
      let existingAlarms = [];
      
      if (existingAlarmsJson) {
        try {
          existingAlarms = JSON.parse(existingAlarmsJson);
          console.log("Found existing alarms:", existingAlarms.length);
        } catch (e) {
          console.error('Error parsing existing alarms:', e);
          // Initialize empty array if parsing fails
          existingAlarms = [];
        }
      }
      
      // Add new alarm
      const updatedAlarms = [...existingAlarms, newAlarm];
      
      // Save updated alarms
      await AsyncStorage.setItem('alarms', JSON.stringify(updatedAlarms));
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
        `Failed to save alarm: ${error.message || 'Unknown error'}. Please try again.`
      );
    }
  }, [selectedTime, activeDays, alarmSound, snoozeTime, repeatOption, alarmLabel, router]);

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
          hourListRef.current?.scrollToIndex({ index, animated: true });
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

  // Memoize the minute item renderer to prevent recreating it on each render
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
          minuteListRef.current?.scrollToIndex({ index, animated: true });
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

  // Get initial scroll indexes
  const getInitialHourIndex = useCallback(() => {
    return hours.findIndex(h => h === selectedTime.hour);
  }, [hours, selectedTime.hour]);

  const getInitialMinuteIndex = useCallback(() => {
    return minutes.findIndex(m => m === selectedTime.minute);
  }, [minutes, selectedTime.minute]);

  // Handle scroll end for hour wheel
  const handleHourScrollEnd = useCallback((event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / 60);
    if (index >= 0 && index < hours.length) {
      setSelectedTime(prev => ({ ...prev, hour: hours[index] }));
    }
  }, [hours]);

  // Handle scroll end for minute wheel
  const handleMinuteScrollEnd = useCallback((event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / 60);
    if (index >= 0 && index < minutes.length) {
      setSelectedTime(prev => ({ ...prev, minute: minutes[index] }));
    }
  }, [minutes]);

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

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
      <View style={styles.timePickerContainer}>
        <View style={styles.timeWheelContainer}>
          <View style={styles.timeWheelGradientTop} />
          
          <View style={styles.timeWheelsRow}>
            <FlatList
              ref={hourListRef}
              data={hours}
              renderItem={renderHourItem}
              keyExtractor={(item) => `hour-${item}`}
              showsVerticalScrollIndicator={false}
              snapToInterval={60}
              decelerationRate="fast"
              initialScrollIndex={fontsLoaded ? getInitialHourIndex() : 0}
              getItemLayout={(data, index) => ({
                length: 60,
                offset: 60 * index,
                index,
              })}
              contentContainerStyle={styles.timeWheelList}
              style={styles.timeWheel}
              onMomentumScrollEnd={handleHourScrollEnd}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={3}
              initialNumToRender={7}
              scrollEventThrottle={16}
              updateCellsBatchingPeriod={50}
              shouldRasterizeIOS={true}
              renderToHardwareTextureAndroid={true}
              onScrollToIndexFailed={(info) => {
                console.log("Failed to scroll to hour index", info.index);
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  if (hourListRef.current) {
                    hourListRef.current.scrollToIndex({ 
                      index: info.index, 
                      animated: true,
                      viewPosition: 0.5
                    });
                  }
                });
              }}
            />
            
            <Text style={styles.timeWheelSeparator}>:</Text>
            
            <FlatList
              ref={minuteListRef}
              data={minutes}
              renderItem={renderMinuteItem}
              keyExtractor={(item) => `minute-${item}`}
              showsVerticalScrollIndicator={false}
              snapToInterval={60}
              decelerationRate="fast"
              initialScrollIndex={fontsLoaded ? getInitialMinuteIndex() : 0}
              getItemLayout={(data, index) => ({
                length: 60,
                offset: 60 * index,
                index,
              })}
              contentContainerStyle={styles.timeWheelList}
              style={styles.timeWheel}
              onMomentumScrollEnd={handleMinuteScrollEnd}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={3}
              initialNumToRender={7}
              scrollEventThrottle={16}
              updateCellsBatchingPeriod={50}
              shouldRasterizeIOS={true}
              renderToHardwareTextureAndroid={true}
              onScrollToIndexFailed={(info) => {
                console.log("Failed to scroll to minute index", info.index);
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  if (minuteListRef.current) {
                    minuteListRef.current.scrollToIndex({ 
                      index: info.index, 
                      animated: true,
                      viewPosition: 0.5
                    });
                  }
                });
              }}
            />
          </View>
          
          <View style={styles.timeWheelGradientBottom} />
        </View>
        
        {/* Current selected time display */}
        <View style={styles.selectedTimeContainer}>
          <Text style={styles.selectedTimeText}>
            {selectedTime.hour}:{selectedTime.minute}
          </Text>
        </View>
      </View>
      
      {/* Day selection */}
      <Text style={styles.sectionTitle}>REPEAT ON</Text>
      {renderDayButtons}
      
      {/* Function buttons */}
      <View style={styles.functionContainer}>
        <View style={styles.functionButtonGroup}>
          <TouchableOpacity style={styles.functionIconButton} onPress={cycleSound}>
            <Ionicons name="musical-note-outline" size={24} color="#a4e4a2" />
          </TouchableOpacity>
          <View style={styles.functionTextContainer}>
            <Text style={styles.functionTitle}>SOUND</Text>
            <Text style={styles.functionValue}>{alarmSound}</Text>
          </View>
        </View>
        
        <View style={styles.functionButtonGroup}>
          <TouchableOpacity style={styles.functionIconButton} onPress={cycleSnooze}>
            <Ionicons name="alarm-outline" size={24} color="#a4e4a2" />
          </TouchableOpacity>
          <View style={styles.functionTextContainer}>
            <Text style={styles.functionTitle}>SNOOZE</Text>
            <Text style={styles.functionValue}>{snoozeTime}</Text>
          </View>
        </View>
        
        <View style={styles.functionButtonGroup}>
          <TouchableOpacity style={styles.functionIconButton} onPress={cycleRepeat}>
            <Ionicons name="repeat-outline" size={24} color="#a4e4a2" />
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
          <Ionicons name="close" size={24} color="#a4e4a2" />
        </TouchableOpacity>
        
        <Text style={styles.controlsText}>CHOOSE TIME</Text>
        
        <TouchableOpacity style={styles.confirmButton} onPress={saveAlarm}>
          <Ionicons name="checkmark" size={24} color="#000" />
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
    alignItems: 'center',
    marginBottom: 30,
  },
  timeWheelContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeWheelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  timeWheel: {
    height: 300,
    width: width * 0.3,
  },
  timeWheelList: {
    paddingVertical: 120,
  },
  timeWheelItem: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTimeWheelItem: {
    // No background color for selected item to match the design
  },
  timeWheelText: {
    fontSize: 36,
    fontFamily: 'digital-mono',
  },
  selectedTimeWheelText: {
    color: '#a4e4a2',
    fontSize: 42,
  },
  dimmedTimeWheelText: {
    color: '#333',
  },
  timeWheelSeparator: {
    color: '#a4e4a2',
    fontSize: 42,
    fontFamily: 'digital-mono',
    marginHorizontal: 10,
  },
  timeWheelGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: '#000',
    opacity: 0.9,
    zIndex: 1,
  },
  timeWheelGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: '#000',
    opacity: 0.9,
    zIndex: 1,
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
  },
  confirmButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#a4e4a2',
    justifyContent: 'center',
    alignItems: 'center',
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
}); 