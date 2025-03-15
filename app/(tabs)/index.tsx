import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Dimensions, FlatList, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { styles } from '../../components/HomeStyles';

const { width } = Dimensions.get('window');

// No need for StyleSheet.create merge since we're importing the complete styles

interface Alarm {
  id: string;
  time: string;
  days: boolean[];
  sound: string;
  snoozeTime: string;
  repeatOption: string;
  label: string;
  isActive: boolean;
  createdAt?: number; // Timestamp when the alarm was created
}

export default function ClockScreen() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showColons, setShowColons] = useState(true);
  const [nextAlarmMinutes, setNextAlarmMinutes] = useState<number | null>(null);
  const [sliderPosition, setSliderPosition] = useState(30);
  const [activeDays, setActiveDays] = useState([false, false, false, true, false, false, false]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [isAlarmActive, setIsAlarmActive] = useState(true);
  
  // Time update effect
  useEffect(() => {
    // Use a single interval for both time update and colon blinking
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setShowColons(prev => !prev);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Load alarms on initial mount
  useEffect(() => {
    loadAlarms();
  }, []);
  
  // Find next alarm when alarms change
  useEffect(() => {
    if (alarms.length > 0) {
      findNextAlarm();
    }
  }, [alarms]);
  
  // Update isAlarmActive when selectedAlarm changes
  useEffect(() => {
    if (selectedAlarm) {
      setIsAlarmActive(selectedAlarm.isActive);
    }
  }, [selectedAlarm]);
  
  // Reload alarms when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAlarms();
      return () => {};
    }, [])
  );
  
  // Load alarms from AsyncStorage
  const loadAlarms = useCallback(async () => {
    try {
      const alarmsData = await AsyncStorage.getItem('alarms');
      if (alarmsData) {
        const parsedAlarms = JSON.parse(alarmsData);
        
        // Add createdAt timestamp for any alarms that don't have it
        const alarmsWithTimestamp = parsedAlarms.map((alarm: Alarm) => ({
          ...alarm,
          createdAt: alarm.createdAt || Date.now() // Use current time if no timestamp exists
        }));
        
        // Sort alarms by creation time (most recent first)
        const sortedAlarms = alarmsWithTimestamp.sort((a: Alarm, b: Alarm) => 
          (b.createdAt || 0) - (a.createdAt || 0)
        );
        
        setAlarms(sortedAlarms);
      }
    } catch (error) {
      console.error('Error loading alarms:', error);
    }
  }, []);
  
  // Find the next alarm and calculate minutes until it
  const findNextAlarm = useCallback(() => {
    if (alarms.length === 0) {
      setNextAlarmMinutes(null);
      setSelectedAlarm(null);
      return;
    }

    const now = new Date();
    const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    let closestAlarm: Alarm | null = null;
    let minDiff = Infinity;

    alarms.forEach(alarm => {
      if (!alarm.isActive) return;
      
      // Check if alarm is set for any day
      if (!alarm.days.some(day => day)) return;
      
      const [hours, minutes] = alarm.time.split(':').map(Number);
      
      // Calculate time difference for each active day
      for (let i = 0; i < 7; i++) {
        if (!alarm.days[i]) continue;
        
        // Calculate days difference (0-6)
        let dayDiff = i - today;
        if (dayDiff < 0) dayDiff += 7; // Wrap around to next week
        
        // If it's today, check if the time has passed
        if (dayDiff === 0) {
          const alarmTime = new Date();
          alarmTime.setHours(hours, minutes, 0, 0);
          
          if (alarmTime <= now) {
            dayDiff = 7; // Move to next week
          }
        }
        
        // Calculate total minutes difference
        const totalMinutes = dayDiff * 24 * 60 + hours * 60 + minutes - (now.getHours() * 60 + now.getMinutes());
        
        if (totalMinutes < minDiff) {
          minDiff = totalMinutes;
          closestAlarm = alarm;
        }
      }
    });

    if (closestAlarm) {
      setSelectedAlarm(closestAlarm);
      setNextAlarmMinutes(minDiff);
      
      // Update slider position based on minutes until alarm
      const maxMinutes = 24 * 60; // 24 hours in minutes
      const percentage = Math.min(100, Math.max(0, (minDiff / maxMinutes) * 100));
      setSliderPosition(percentage);
    } else {
      setSelectedAlarm(null);
      setNextAlarmMinutes(null);
    }
  }, [alarms]);
  
  // Format time for display
  const formatTime = useCallback((date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    return {
      hours: formattedHours,
      minutes: formattedMinutes,
      seconds: formattedSeconds
    };
  }, []);
  
  // Format time for alarm display (12-hour format)
  const formatAlarmTime = useCallback((timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }, []);
  
  // Generate white lines for progress bar - memoized with deps array to prevent recreation
  const progressBarLines = useMemo(() => {
    // Reduce the number of lines for better performance while maintaining visual appearance
    const lineCount = Platform.OS === 'web' ? 30 : 60; // Fewer lines on web for better performance
    const lines = [];
    for (let i = 0; i < lineCount; i++) {
      const isRed = i < lineCount/2;
      lines.push(
        <View 
          key={i} 
          style={[
            styles.progressLine, 
            { 
              backgroundColor: isRed ? '#ff5252' : '#a4e4a2',
              width: Platform.OS === 'web' ? 2 : 1, // Slightly wider lines on web for fewer elements
              marginHorizontal: Platform.OS === 'web' ? 2 : 1
            }
          ]} 
        />
      );
    }
    return lines;
  }, []); // Empty deps - only create once
  
  // Get day abbreviations with current day highlighted
  const dayAbbreviations = useMemo(() => {
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const currentDay = currentTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const adjustedCurrentDay = currentDay === 0 ? 6 : currentDay - 1; // Adjust to match our array (0 = Monday)
    
    return days.map((day, index) => (
      <TouchableOpacity 
        key={index}
        onPress={() => {
          const newActiveDays = [...activeDays];
          newActiveDays[index] = !newActiveDays[index];
          setActiveDays(newActiveDays);
        }}
        style={{ pointerEvents: 'auto' }}
      >
        <Text 
          style={[
            styles.dayText, 
            index === adjustedCurrentDay && styles.currentDayText,
            selectedAlarm?.days[index] && styles.activeDayText
          ]}
        >
          {day}
        </Text>
      </TouchableOpacity>
    ));
  }, [currentTime, activeDays, selectedAlarm]);
  
  // Toggle alarm active state
  const toggleAlarmActive = useCallback(async (alarm: Alarm) => {
    try {
      console.log("Toggling alarm state for alarm ID:", alarm.id);
      
      // Create a new isActive state (opposite of current)
      const newIsActive = !alarm.isActive;
      console.log("Setting alarm active state to:", newIsActive);
      
      // Update the alarm in the alarms array
      const updatedAlarms = alarms.map(a => 
        a.id === alarm.id 
          ? { ...a, isActive: newIsActive } 
          : a
      );
      
      // Update local state
      setAlarms(updatedAlarms);
      
      // If this is the selected alarm, update its state too
      if (selectedAlarm && selectedAlarm.id === alarm.id) {
        setIsAlarmActive(newIsActive);
        setSelectedAlarm({...selectedAlarm, isActive: newIsActive});
      }
      
      // Save to storage
      try {
        await AsyncStorage.setItem('alarms', JSON.stringify(updatedAlarms));
        console.log("Successfully saved updated alarm state to storage");
      } catch (error) {
        console.error('Error saving alarm state to storage:', error);
        throw error; // Rethrow to be caught by outer try/catch
      }
    } catch (error) {
      console.error('Error toggling alarm state:', error);
      Alert.alert('Error', 'Failed to update alarm. Please try again.');
    }
  }, [alarms, selectedAlarm]);
  
  // Delete alarm
  const deleteAlarm = useCallback((alarm: Alarm) => {
    console.log("Attempting to delete alarm ID:", alarm.id);
    
    Alert.alert(
      "Delete Alarm",
      "Are you sure you want to delete this alarm?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("Alarm deletion cancelled")
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              console.log("Proceeding with alarm deletion for ID:", alarm.id);
              
              // Filter out the alarm to delete
              const updatedAlarms = alarms.filter(a => a.id !== alarm.id);
              console.log(`Filtered alarms from ${alarms.length} to ${updatedAlarms.length}`);
              
              // Update local state first
              setAlarms(updatedAlarms);
              
              // If we're deleting the selected alarm, clear the selection
              if (selectedAlarm && selectedAlarm.id === alarm.id) {
                console.log("Deleted alarm was the selected alarm, clearing selection");
                setSelectedAlarm(null);
              }
              
              // Save to storage
              try {
                await AsyncStorage.setItem('alarms', JSON.stringify(updatedAlarms));
                console.log("Successfully saved updated alarms to storage after deletion");
              } catch (storageError) {
                console.error('Error saving to storage after deletion:', storageError);
                throw storageError; // Rethrow to be caught by outer try/catch
              }
            } catch (error) {
              console.error('Error during alarm deletion:', error);
              Alert.alert('Error', 'Failed to delete alarm. Please try again.');
            }
          },
          style: "destructive"
        }
      ]
    );
  }, [alarms, selectedAlarm]);

  // Format days display
  const getFormattedDays = useCallback((alarm: Alarm) => {
    return alarm.days.map((active, index) => 
      active ? ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][index].substring(0, 1) : ''
    ).filter(Boolean).join(' ');
  }, []);

  // Navigate to alarm screen
  const navigateToAlarmScreen = useCallback(() => {
    router.push('/(tabs)/alarm');
  }, [router]);

  // Render the clock
  const renderClock = useCallback(() => {
    const { hours, minutes, seconds } = formatTime(currentTime);
    
    return (
      <View style={styles.clockContainer}>
        <Text style={styles.mainTime}>
          {hours}
          <Text style={[styles.colon, !showColons && styles.colonHidden]}>:</Text>
          {minutes}
          <Text style={[styles.seconds, !showColons && styles.colonHidden]}>:{seconds}</Text>
        </Text>
      </View>
    );
  }, [currentTime, showColons, formatTime]);

  // Render an individual alarm item
  const renderAlarmItem = useCallback(({ item }: { item: Alarm }) => {
    return (
      <View style={styles.alarmItem}>
        <View style={styles.alarmTimeContainer}>
          <Text style={[styles.alarmTime, !item.isActive && styles.inactiveAlarmText]}>
            {formatAlarmTime(item.time)}
          </Text>
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => toggleAlarmActive(item)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={item.isActive ? "play-circle" : "pause-circle"} 
              size={32} 
              color={item.isActive ? "#a4e4a2" : "#666"} 
            />
          </TouchableOpacity>
        </View>
        <View style={styles.alarmDetailsContainer}>
          <Text style={[styles.songTitle, !item.isActive && styles.inactiveAlarmText]}>
            {item.label || "ALARM"}
          </Text>
          <Text style={styles.alarmDays}>{getFormattedDays(item)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => deleteAlarm(item)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color="#ff5252" />
        </TouchableOpacity>
      </View>
    );
  }, [formatAlarmTime, toggleAlarmActive, getFormattedDays, deleteAlarm]);

  // Render alarm list section
  const renderAlarmList = useCallback(() => {
    if (alarms.length === 0) {
      return (
        <View style={styles.alarmBox}>
          <Text style={styles.noAlarmText}>NO ALARMS SET</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.alarmListContainer}>
        <Text style={styles.sectionTitle}>ALARMS</Text>
        <FlatList
          data={alarms}
          renderItem={renderAlarmItem}
          keyExtractor={(item) => item.id}
          style={styles.alarmList}
          contentContainerStyle={styles.alarmListContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }, [alarms, renderAlarmItem]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>{formatTime(currentTime).hours}:{formatTime(currentTime).minutes}</Text>
        <View style={styles.battery}>
          <Text style={styles.signal}>●●●●</Text>
          <Ionicons name="battery-full" size={24} color="#a4e4a2" />
        </View>
      </View>
      
      {renderClock()}
      
      <View style={styles.nextAlarmContainer}>
        <Text style={styles.nextAlarmText}>
          {nextAlarmMinutes !== null && selectedAlarm ? (
            `NEXT ALARM IN ${Math.floor(nextAlarmMinutes / 60)}h ${nextAlarmMinutes % 60}m`
          ) : (
            "NO ALARM SET"
          )}
        </Text>
      </View>
      
      {renderAlarmList()}
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={navigateToAlarmScreen}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={36} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}