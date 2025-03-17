import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, StatusBar, ActivityIndicator, ScrollView, Switch, TextInput, KeyboardAvoidingView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Font from 'expo-font';
import VirtualizedList from '../../components/VirtualizedList';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAsyncStorageCache } from '../../hooks/useAsyncStorageCache';
import SafeTouchableOpacity from '../../components/SafeTouchableOpacity';

const INITIAL_HOUR = new Date().getHours().toString().padStart(2, '0');
const INITIAL_MINUTE = new Date().getMinutes().toString().padStart(2, '0');

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Constants
const ALARM_STORAGE_KEY = '@alarm_settings';

// Pixel-style icons represented as text
const Icons = {
  back: "◀",
  save: "✓",
  repeat: "↻",
  sound: "♪",
  cancel: "✕"
};

interface Alarm {
  id: string;
  time: string;
  days: boolean[];
  sound: string;
  snoozeTime: string;
  repeatOption: string;
  label: string;
  isActive: boolean;
  createdAt?: number;
}

// Define styles outside of the component to avoid the "Cannot access 'styles' before initialization" error
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    color: '#a4e4a2',
    fontSize: 24,
    fontFamily: 'Doto',
    letterSpacing: 2,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#a4e4a2',
    fontSize: 24,
    fontFamily: 'Doto',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#a4e4a2',
    fontSize: 24,
    fontFamily: 'Doto',
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
  timeWheelItem: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTimeWheelItem: {
    backgroundColor: 'rgba(164, 228, 162, 0.1)',
  },
  timeWheelText: {
    fontFamily: Platform.select({ 
      web: 'monospace', 
      default: 'Doto' 
    }),
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
    fontFamily: Platform.select({ 
      web: 'monospace', 
      default: 'Doto' 
    }),
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
    fontFamily: Platform.select({ 
      web: 'monospace', 
      default: 'Doto' 
    }),
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
    color: '#a4e4a2',
    fontSize: 12,
    fontFamily: 'Doto',
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  confirmButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#a4e4a2',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      },
    }),
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
  content: {
    flex: 1,
    padding: 16,
  },
  timeDisplay: {
    backgroundColor: '#121212',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  timeText: {
    color: '#fff',
    fontSize: 40,
    fontFamily: 'Doto',
  },
  timePicker: {
    width: Platform.OS === 'ios' ? '100%' : 'auto',
    height: 180,
  },
  section: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Doto',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Doto',
  },
  optionValue: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Doto',
  },
  optionButton: {
    padding: 8,
  },
  arrowIcon: {
    color: '#666',
    fontSize: 18,
    fontFamily: 'Doto',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  pickerItemText: {
    color: '#ffffff',
    fontFamily: 'Doto',
    fontSize: 18,
  },
  labelText: {
    color: '#a4e4a2',
    fontFamily: 'Doto',
    fontSize: 16,
    marginBottom: 10,
  },
  soundText: {
    color: '#a4e4a2',
    fontFamily: 'Doto',
    fontSize: 16,
    marginBottom: 10,
  },
  soundOption: {
    color: '#ffffff',
    fontFamily: 'Doto',
    fontSize: 14,
  },
  switchText: {
    color: '#a4e4a2',
    fontFamily: 'Doto',
    fontSize: 16,
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Doto',
  },
});

export default function AlarmScreen() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showColons, setShowColons] = useState(true);
  const [selectedTime, setSelectedTime] = useState({ hour: INITIAL_HOUR, minute: INITIAL_MINUTE });
  const [activeDays, setActiveDays] = useState([false, false, false, true, false, false, false]);
  const [alarmSound, setAlarmSound] = useState('WAKE UP');
  const [snoozeTime, setSnoozeTime] = useState('EVERY 10 MIN');
  const [repeatOption, setRepeatOption] = useState('NO');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === 'ios');
  const [label, setLabel] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const { data: alarms = [], saveData: saveAlarms } = useAsyncStorageCache('alarms', []);

  // Generate hours and minutes for the time picker wheels
  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  }, []);

  const minutes = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  }, []);

  // Handle snooze
  const handleSnooze = useCallback(async () => {
    try {
      const snoozeMinutes = parseInt(snoozeTime.split(' ')[2]);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Snoozed Alarm',
          body: `Alarm snoozed for ${snoozeMinutes} minutes`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          seconds: snoozeMinutes * 60,
        },
      });
    } catch (error) {
      console.error('Error setting snooze:', error);
    }
  }, [snoozeTime]);

  // Format time as HH:MM
  const formatTime = useCallback((date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return showColons ? `${hours}:${minutes}` : `${hours} ${minutes}`;
  }, [showColons]);

  // Handle day selection
  const toggleDay = useCallback((index: number) => {
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

  // Save alarm settings
  const saveAlarmSettings = useCallback(async () => {
    try {
      const settings = {
        hour: selectedTime.hour,
        minute: selectedTime.minute,
        sound: alarmSound,
        snooze: snoozeTime,
        repeat: repeatOption,
      };
      await AsyncStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving alarm settings:', error);
    }
  }, [selectedTime, alarmSound, snoozeTime, repeatOption]);

  // Schedule alarm
  const scheduleAlarm = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Please enable notifications to set alarms');
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();

      const now = new Date();
      const alarmTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        parseInt(selectedTime.hour),
        parseInt(selectedTime.minute)
      );

      if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Alarm',
          body: `It's ${selectedTime.hour}:${selectedTime.minute}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          sticky: true,
          vibrate: [0, 250, 250, 250],
          data: {
            alarmTime: alarmTime.toISOString(),
            snoozeTime,
            repeatOption,
          },
        },
        trigger: {
          seconds: Math.floor((alarmTime.getTime() - Date.now()) / 1000),
          repeats: repeatOption !== 'NO',
        },
      });

      await saveAlarmSettings();
      router.back();
    } catch (error) {
      console.error('Error scheduling alarm:', error);
      setError('Failed to set alarm. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTime, snoozeTime, repeatOption, saveAlarmSettings, router]);

  // Load fonts effect
  useEffect(() => {
    const loadFonts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load only the custom font, Ionicons is handled by @expo/vector-icons
        await Font.loadAsync({
          'digital-mono': require('../../assets/fonts/digital7mono.ttf'),
        });
        
        setFontsLoaded(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setError('Failed to load fonts. Please check your internet connection and try again.');
        setIsLoading(false);
      }
    };

    loadFonts();
  }, []);

  // Load alarm settings and setup notifications effect
  useEffect(() => {
    const loadAlarmSettings = async () => {
      try {
        const settings = await AsyncStorage.getItem(ALARM_STORAGE_KEY);
        if (settings) {
          const { hour, minute, sound, snooze, repeat } = JSON.parse(settings);
          setSelectedTime({ hour, minute });
          setAlarmSound(sound);
          setSnoozeTime(snooze);
          setRepeatOption(repeat);
        }
      } catch (error) {
        console.error('Error loading alarm settings:', error);
      }
    };

    const setupNotificationListeners = async () => {
      try {
        const notificationSubscription = await Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification received:', notification);
        });
        notificationListener.current = notificationSubscription;

        const responseSubscription = await Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification response:', response);
          if (response.actionIdentifier === 'SNOOZE') {
            handleSnooze();
          }
        });
        responseListener.current = responseSubscription;
      } catch (error) {
        console.error('Error setting up notification listeners:', error);
      }
    };

    loadAlarmSettings();
    setupNotificationListeners();

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [handleSnooze]);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setShowColons(prev => !prev);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Render time picker wheels
  const renderTimePicker = useMemo(() => {
    const renderHourItem = ({ item }: { item: string }) => {
      const isSelected = item === selectedTime.hour;
      return (
        <TouchableOpacity
          style={[
            styles.timeWheelItem,
            isSelected && styles.selectedTimeWheelItem
          ]}
          onPress={() => setSelectedTime(prev => ({ ...prev, hour: item }))}
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
    };

    const renderMinuteItem = ({ item }: { item: string }) => {
      const isSelected = item === selectedTime.minute;
      return (
        <TouchableOpacity
          style={[
            styles.timeWheelItem,
            isSelected && styles.selectedTimeWheelItem
          ]}
          onPress={() => setSelectedTime(prev => ({ ...prev, minute: item }))}
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
    };

    return (
      <View style={styles.timePickerContainer}>
        <VirtualizedList
          data={hours}
          renderItem={renderHourItem}
          keyExtractor={(item: string) => item}
          itemHeight={60}
          style={styles.timeWheel}
          contentContainerStyle={{
            ...styles.timeWheelContent,
            paddingVertical: 60
          }}
          initialScrollIndex={hours.indexOf(selectedTime.hour)}
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={60}
        />
        <Text style={styles.timeWheelSeparator}>:</Text>
        <VirtualizedList
          data={minutes}
          renderItem={renderMinuteItem}
          keyExtractor={(item: string) => item}
          itemHeight={60}
          style={styles.timeWheel}
          contentContainerStyle={{
            ...styles.timeWheelContent,
            paddingVertical: 60
          }}
          initialScrollIndex={minutes.indexOf(selectedTime.minute)}
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={60}
        />
      </View>
    );
  }, [hours, minutes, selectedTime]);

  // Render day buttons
  const renderDayButtons = useMemo(() => {
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    return (
      <View style={styles.daysContainer}>
        {days.map((day, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => toggleDay(index)}
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

  // Show loading screen
  if (isLoading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading...</Text>
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
            setError(null);
            setIsLoading(true);
            setFontsLoaded(false);
          }}
        >
          <Text style={[styles.retryButtonText, { fontFamily: Platform.OS === 'web' ? 'monospace' : undefined }]}>
            RETRY
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
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
        <SafeTouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{Icons.back}</Text>
        </SafeTouchableOpacity>
        <Text style={styles.headerTitle}>ADD ALARM</Text>
        <SafeTouchableOpacity onPress={() => {
          setError(null);
          setIsLoading(true);
          setFontsLoaded(false);
        }} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>{Icons.save}</Text>
        </SafeTouchableOpacity>
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
        
        <TouchableOpacity style={styles.confirmButton} onPress={scheduleAlarm}>
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
    </KeyboardAvoidingView>
  );
} 