import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Vibration, Platform, Dimensions, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

const { width, height } = Dimensions.get('window');

export default function TimerScreen() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTime, setSelectedTime] = useState(0);
  const [showColons, setShowColons] = useState(true);
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const [selectedSeconds, setSelectedSeconds] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarmSound, setAlarmSound] = useState('WAKE UP');
  const [snoozeTime, setSnoozeTime] = useState('EVERY 10 MIN');
  const [repeatOption, setRepeatOption] = useState('NO');
  
  const intervalRef = useRef(null);
  const endTimeRef = useRef(0);
  const notificationListener = useRef();
  const responseListener = useRef();
  const hoursListRef = useRef(null);
  const minutesListRef = useRef(null);
  const secondsListRef = useRef(null);

  // Predefined timer options in seconds
  const timerOptions = [
    { label: '1 MIN', value: 60 },
    { label: '3 MIN', value: 180 },
    { label: '5 MIN', value: 300 },
    { label: '10 MIN', value: 600 },
    { label: '15 MIN', value: 900 },
    { label: '30 MIN', value: 1800 },
    { label: '45 MIN', value: 2700 },
    { label: '1 HOUR', value: 3600 },
  ];

  // Generate hours, minutes, and seconds for the time picker wheels
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

  const seconds = useMemo(() => {
    const result = [];
    for (let i = 0; i < 60; i++) {
      result.push(i.toString().padStart(2, '0'));
    }
    return result;
  }, []);

  // Register for notifications
  useEffect(() => {
    registerForPushNotificationsAsync();

    // Listen for notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Handle received notification
      Vibration.vibrate(1000);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle notification response (user tapped on notification)
      Vibration.cancel();
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setShowColons(prev => !prev);
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearInterval(blinkInterval);
    };
  }, []);

  // Register for push notifications
  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('timer', {
        name: 'Timer',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };

  // Schedule notification
  const scheduleTimerNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Timer Complete',
        body: 'Your timer has finished!',
        sound: true,
      },
      trigger: null, // Immediate notification
    });
  };

  const startTimer = () => {
    if (timeLeft <= 0 && !isPaused) {
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    
    const now = Date.now();
    endTimeRef.current = now + (timeLeft * 1000);
    
    intervalRef.current = setInterval(() => {
      const remaining = Math.round((endTimeRef.current - Date.now()) / 1000);
      
      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        setTimeLeft(0);
        setIsRunning(false);
        
        // Trigger notification and vibration
        scheduleTimerNotification();
        Vibration.vibrate([500, 1000, 500, 1000], true);
        
        // Auto-repeat if enabled
        if (repeatOption === 'DAILY') {
          setTimeout(() => {
            setTimeLeft(selectedTime);
            startTimer();
          }, 5000);
        }
      } else {
        setTimeLeft(remaining);
      }
    }, 100);
  };

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRunning(false);
    setIsPaused(true);
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimeLeft(selectedTime);
    setIsRunning(false);
    setIsPaused(false);
    Vibration.cancel();
  };

  const updateSelectedTime = useCallback(() => {
    const totalSeconds = (parseInt(selectedHours) * 3600) + 
                         (parseInt(selectedMinutes) * 60) + 
                         parseInt(selectedSeconds);
    setSelectedTime(totalSeconds);
    setTimeLeft(totalSeconds);
  }, [selectedHours, selectedMinutes, selectedSeconds]);

  useEffect(() => {
    updateSelectedTime();
  }, [selectedHours, selectedMinutes, selectedSeconds, updateSelectedTime]);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0')
    };
  };

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

  // Render hour item
  const renderHourItem = ({ item, index }) => {
    const isSelected = item === selectedHours.toString().padStart(2, '0');
    
    return (
      <TouchableOpacity
        style={[
          styles.timeWheelItem,
          isSelected && styles.selectedTimeWheelItem
        ]}
        onPress={() => {
          setSelectedHours(parseInt(item));
          hoursListRef.current?.scrollToIndex({ index, animated: true });
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
  };

  // Render minute item
  const renderMinuteItem = ({ item, index }) => {
    const isSelected = item === selectedMinutes.toString().padStart(2, '0');
    
    return (
      <TouchableOpacity
        style={[
          styles.timeWheelItem,
          isSelected && styles.selectedTimeWheelItem
        ]}
        onPress={() => {
          setSelectedMinutes(parseInt(item));
          minutesListRef.current?.scrollToIndex({ index, animated: true });
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
  };

  // Render second item
  const renderSecondItem = ({ item, index }) => {
    const isSelected = item === selectedSeconds.toString().padStart(2, '0');
    
    return (
      <TouchableOpacity
        style={[
          styles.timeWheelItem,
          isSelected && styles.selectedTimeWheelItem
        ]}
        onPress={() => {
          setSelectedSeconds(parseInt(item));
          secondsListRef.current?.scrollToIndex({ index, animated: true });
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
  };

  // Get initial scroll indexes
  const getInitialHourIndex = useCallback(() => {
    return hours.findIndex(h => h === selectedHours.toString().padStart(2, '0'));
  }, [hours, selectedHours]);

  const getInitialMinuteIndex = useCallback(() => {
    return minutes.findIndex(m => m === selectedMinutes.toString().padStart(2, '0'));
  }, [minutes, selectedMinutes]);

  const getInitialSecondIndex = useCallback(() => {
    return seconds.findIndex(s => s === selectedSeconds.toString().padStart(2, '0'));
  }, [seconds, selectedSeconds]);

  // Handle scroll end for wheels
  const handleHourScrollEnd = useCallback((event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / 60);
    if (index >= 0 && index < hours.length) {
      setSelectedHours(parseInt(hours[index]));
    }
  }, [hours]);

  const handleMinuteScrollEnd = useCallback((event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / 60);
    if (index >= 0 && index < minutes.length) {
      setSelectedMinutes(parseInt(minutes[index]));
    }
  }, [minutes]);

  const handleSecondScrollEnd = useCallback((event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / 60);
    if (index >= 0 && index < seconds.length) {
      setSelectedSeconds(parseInt(seconds[index]));
    }
  }, [seconds]);

  const formattedTime = formatTime(timeLeft);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>
          {currentTime.getHours().toString().padStart(2, '0')}
          {showColons ? ':' : ' '}
          {currentTime.getMinutes().toString().padStart(2, '0')}
        </Text>
        <View style={styles.battery}>
          <Text style={styles.signal}>●●●●</Text>
          <Text style={styles.wifi}>▲</Text>
          <Text style={styles.batt}>■</Text>
        </View>
      </View>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SET TIMER</Text>
      </View>
      
      {isRunning || isPaused ? (
        // Timer running display
        <View style={styles.runningTimerContainer}>
          <Text style={styles.digitalTimeText}>
            {formattedTime.hours}
            <Text style={showColons ? styles.colonVisible : styles.colonHidden}>:</Text>
            {formattedTime.minutes}
            <Text style={showColons ? styles.colonVisible : styles.colonHidden}>:</Text>
            {formattedTime.seconds}
          </Text>
          
          <View style={styles.timerControls}>
            <TouchableOpacity 
              style={styles.timerControlButton} 
              onPress={resetTimer}
            >
              <Ionicons name="refresh" size={24} color="#a4e4a2" />
            </TouchableOpacity>
            
            {isPaused ? (
              <TouchableOpacity 
                style={styles.timerControlButton} 
                onPress={startTimer}
              >
                <Ionicons name="play" size={24} color="#a4e4a2" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.timerControlButton} 
                onPress={pauseTimer}
              >
                <Ionicons name="pause" size={24} color="#a4e4a2" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        // Time picker wheels
        <View style={styles.timePickerContainer}>
          <View style={styles.timeWheelContainer}>
            <View style={styles.timeWheelGradientTop} />
            
            <View style={styles.timeWheelsRow}>
              <FlatList
                ref={hoursListRef}
                data={hours}
                renderItem={renderHourItem}
                keyExtractor={(item) => `hour-${item}`}
                showsVerticalScrollIndicator={false}
                snapToInterval={60}
                decelerationRate="fast"
                initialScrollIndex={getInitialHourIndex()}
                getItemLayout={(data, index) => ({
                  length: 60,
                  offset: 60 * index,
                  index,
                })}
                contentContainerStyle={styles.timeWheelList}
                style={styles.timeWheel}
                onMomentumScrollEnd={handleHourScrollEnd}
              />
              
              <Text style={styles.timeWheelSeparator}>:</Text>
              
              <FlatList
                ref={minutesListRef}
                data={minutes}
                renderItem={renderMinuteItem}
                keyExtractor={(item) => `minute-${item}`}
                showsVerticalScrollIndicator={false}
                snapToInterval={60}
                decelerationRate="fast"
                initialScrollIndex={getInitialMinuteIndex()}
                getItemLayout={(data, index) => ({
                  length: 60,
                  offset: 60 * index,
                  index,
                })}
                contentContainerStyle={styles.timeWheelList}
                style={styles.timeWheel}
                onMomentumScrollEnd={handleMinuteScrollEnd}
              />
              
              <Text style={styles.timeWheelSeparator}>:</Text>
              
              <FlatList
                ref={secondsListRef}
                data={seconds}
                renderItem={renderSecondItem}
                keyExtractor={(item) => `second-${item}`}
                showsVerticalScrollIndicator={false}
                snapToInterval={60}
                decelerationRate="fast"
                initialScrollIndex={getInitialSecondIndex()}
                getItemLayout={(data, index) => ({
                  length: 60,
                  offset: 60 * index,
                  index,
                })}
                contentContainerStyle={styles.timeWheelList}
                style={styles.timeWheel}
                onMomentumScrollEnd={handleSecondScrollEnd}
              />
            </View>
            
            <View style={styles.timeWheelGradientBottom} />
          </View>
          
          {/* Current selected time display */}
          <View style={styles.selectedTimeContainer}>
            <Text style={styles.selectedTimeText}>
              {selectedHours.toString().padStart(2, '0')}:
              {selectedMinutes.toString().padStart(2, '0')}:
              {selectedSeconds.toString().padStart(2, '0')}
            </Text>
          </View>
        </View>
      )}
      
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
        <TouchableOpacity style={styles.cancelButton}>
          <Ionicons name="close" size={24} color="#a4e4a2" />
        </TouchableOpacity>
        
        <Text style={styles.controlsText}>CHOOSE TIME</Text>
        
        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={isRunning || isPaused ? resetTimer : startTimer}
        >
          <Ionicons 
            name={isRunning || isPaused ? "refresh" : "play"} 
            size={24} 
            color="#000" 
          />
        </TouchableOpacity>
      </View>
      
      {/* Home bar */}
      <View style={styles.homeBar} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusTime: {
    color: '#a4e4a2',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  battery: {
    flexDirection: 'row',
  },
  signal: {
    color: '#a4e4a2',
    marginRight: 5,
    fontSize: 10,
  },
  wifi: {
    color: '#a4e4a2',
    marginRight: 5,
    fontSize: 10,
  },
  batt: {
    color: '#a4e4a2',
    fontSize: 10,
  },
  header: {
    marginBottom: 30,
  },
  headerTitle: {
    color: '#a4e4a2',
    fontSize: 24,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  runningTimerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  digitalTimeText: {
    color: '#a4e4a2',
    fontSize: 48,
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  colonVisible: {
    opacity: 1,
  },
  colonHidden: {
    opacity: 0,
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  timerControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(164, 228, 162, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
    width: width * 0.2,
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
    fontFamily: 'monospace',
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
    fontFamily: 'monospace',
    marginHorizontal: 5,
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
    fontFamily: 'monospace',
    textAlign: 'center',
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
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  functionValue: {
    color: '#a4e4a2',
    fontSize: 12,
    fontFamily: 'monospace',
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
    fontFamily: 'monospace',
  },
  homeBar: {
    width: 100,
    height: 5,
    backgroundColor: '#a4e4a2',
    borderRadius: 2.5,
    alignSelf: 'center',
  },
}); 