import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Dimensions, FlatList, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { styles } from '../../components/HomeStyles';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { useAsyncStorageCache } from '../../hooks/useAsyncStorageCache';
import VirtualizedList from '../../components/VirtualizedList';
import { useWebWorker } from '../../hooks/useWebWorker';
import SafeTouchableOpacity from '../../components/SafeTouchableOpacity';

const { width } = Dimensions.get('window');

// Pixel-style icons represented as text
const Icons = {
  battery: "■■■■■■",
  signal: "●●●●",
  play: "►",
  pause: "⏸",
  trash: "⛔",
  add: "+"
};

// Memoized components for better performance
const Clock = React.memo(({ time }: { time: Date }) => {
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const showColons = time.getSeconds() % 2 === 0;

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
});

const AlarmItem = React.memo(({ 
  item, 
  onToggle, 
  onDelete, 
  formatAlarmTime, 
  getFormattedDays 
}: { 
  item: Alarm, 
  onToggle: (alarm: Alarm) => void, 
  onDelete: (alarm: Alarm) => void,
  formatAlarmTime: (timeString: string) => string,
  getFormattedDays: (alarm: Alarm) => string
}) => {
  return (
    <View style={styles.alarmItem}>
      <View style={styles.alarmTimeContainer}>
        <Text style={[styles.alarmTime, !item.isActive && styles.inactiveAlarmText]}>
          {formatAlarmTime(item.time)}
        </Text>
        <SafeTouchableOpacity 
          style={styles.toggleButton}
          onPress={() => onToggle(item)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text 
            style={{ 
              fontSize: 24, 
              color: item.isActive ? "#a4e4a2" : "#666", 
              fontFamily: 'Doto' 
            }}
          >
            {item.isActive ? Icons.play : Icons.pause}
          </Text>
        </SafeTouchableOpacity>
      </View>
      <View style={styles.alarmDetailsContainer}>
        <Text style={[styles.songTitle, !item.isActive && styles.inactiveAlarmText]}>
          {item.label || "ALARM"}
        </Text>
        <Text style={styles.alarmDays}>{getFormattedDays(item)}</Text>
      </View>
      <SafeTouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => onDelete(item)}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={{ fontSize: 18, color: "#ff5252", fontFamily: 'Doto' }}>{Icons.trash}</Text>
      </SafeTouchableOpacity>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.item.id === nextProps.item.id && 
    prevProps.item.isActive === nextProps.item.isActive && 
    prevProps.item.time === nextProps.item.time && 
    prevProps.item.label === nextProps.item.label &&
    JSON.stringify(prevProps.item.days) === JSON.stringify(nextProps.item.days)
  );
});

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
  const perf = usePerformanceMonitor('ClockScreen');
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextAlarmMinutes, setNextAlarmMinutes] = useState<number | null>(null);
  const [sliderPosition, setSliderPosition] = useState(30);
  const [activeDays, setActiveDays] = useState([false, false, false, true, false, false, false]);
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [isAlarmActive, setIsAlarmActive] = useState(true);
  
  const { data: cachedAlarms, saveData: saveCachedAlarms, loadData: refreshAlarms } = useAsyncStorageCache('alarms', []);

  // Setup the worker
  const { compute: findNextAlarmCompute, isProcessing: isFindingNextAlarm } = useWebWorker(
    Platform.OS === 'web' ? '/workers/alarmWorker.js' : null,
    []
  );

  // Define findNextAlarm before it's used in useEffect
  const findNextAlarm = useCallback(async () => {
    perf.logRender('findNextAlarm');
    
    if (!cachedAlarms || cachedAlarms.length === 0) {
      setNextAlarmMinutes(null);
      setSelectedAlarm(null);
      return;
    }
    
    try {
      const result = await findNextAlarmCompute(cachedAlarms);
      
      if (result.selectedAlarm) {
        setSelectedAlarm(result.selectedAlarm);
        setNextAlarmMinutes(result.nextAlarmMinutes);
        
        const maxMinutes = 24 * 60;
        const percentage = Math.min(100, Math.max(0, ((result.nextAlarmMinutes || 0) / maxMinutes) * 100));
        setSliderPosition(percentage);
      } else {
        setSelectedAlarm(null);
        setNextAlarmMinutes(null);
      }
    } catch (error) {
      console.error('Error finding next alarm:', error);
      setNextAlarmMinutes(null);
      setSelectedAlarm(null);
    }
  }, [cachedAlarms, findNextAlarmCompute, perf]);

  // Update loadAlarms function
  const loadAlarms = useCallback(async () => {
    refreshAlarms();
  }, [refreshAlarms]);
  
  // Time update effect - optimized for performance
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Load alarms on mount
  useEffect(() => {
    loadAlarms();
  }, [loadAlarms]);
  
  // Find next alarm when alarms change
  useEffect(() => {
    if (cachedAlarms?.length > 0) {
      findNextAlarm();
    } else {
      setNextAlarmMinutes(null);
      setSelectedAlarm(null);
    }
  }, [cachedAlarms, findNextAlarm]);
  
  // Update isAlarmActive when selectedAlarm changes
  useEffect(() => {
    if (selectedAlarm) {
      setIsAlarmActive(selectedAlarm.isActive);
    }
  }, [selectedAlarm]);
  
  // Reload alarms when screen comes into focus - optimized to reduce unnecessary reloads
  useFocusEffect(
    useCallback(() => {
      const timerId = setTimeout(() => {
        loadAlarms();
      }, 300);
      
      return () => clearTimeout(timerId);
    }, [loadAlarms])
  );

  // Memoize the formatted time string
  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }, [currentTime]);

  // Format time for alarm display (12-hour format)
  const formatAlarmTime = useCallback((timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }, []);

  // Generate white lines for progress bar - memoized with deps array to prevent recreation
  const progressBarLines = useMemo(() => {
    perf.logRender('progressBarLines');
    // Reduce the number of lines for better performance while maintaining visual appearance
    const lineCount = Platform.OS === 'web' ? 15 : 30; // Even fewer lines on web for better performance
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
              width: Platform.OS === 'web' ? 3 : 2, // Wider lines on web for fewer elements
              marginHorizontal: Platform.OS === 'web' ? 3 : 2
            }
          ]} 
        />
      );
    }
    return lines;
  }, []); // Empty deps - only create once
  
  // Get day abbreviations with current day highlighted
  const dayAbbreviations = useMemo(() => {
    perf.logRender('dayAbbreviations');
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const currentDay = currentTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const adjustedCurrentDay = currentDay === 0 ? 6 : currentDay - 1; // Adjust to match our array (0 = Monday)
    
    return days.map((day, index) => (
      <SafeTouchableOpacity 
        key={index}
        onPress={() => {
          const newActiveDays = [...activeDays];
          newActiveDays[index] = !newActiveDays[index];
          setActiveDays(newActiveDays);
        }}
        pointerEventsMode="auto"
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
      </SafeTouchableOpacity>
    ));
  }, [currentTime, activeDays, selectedAlarm]);
  
  // Toggle alarm active state
  const toggleAlarmActive = useCallback(async (alarm: Alarm) => {
    perf.logRender('toggleAlarmActive');
    try {
      console.log("Toggling alarm state for alarm ID:", alarm.id);
      
      // Create a new isActive state (opposite of current)
      const newIsActive = !alarm.isActive;
      console.log("Setting alarm active state to:", newIsActive);
      
      // Update the alarm in the alarms array
      const updatedAlarms = cachedAlarms.map(a => 
        a.id === alarm.id 
          ? { ...a, isActive: newIsActive } 
          : a
      );
      
      // Update cached alarms
      saveCachedAlarms(updatedAlarms);
      
      // If this is the selected alarm, update its state too
      if (selectedAlarm && selectedAlarm.id === alarm.id) {
        setIsAlarmActive(newIsActive);
        setSelectedAlarm({...selectedAlarm, isActive: newIsActive});
      }
    } catch (error) {
      console.error('Error toggling alarm state:', error);
      Alert.alert('Error', 'Failed to update alarm. Please try again.');
    }
  }, [cachedAlarms, selectedAlarm, saveCachedAlarms]);
  
  // Delete alarm
  const deleteAlarm = useCallback((alarm: Alarm) => {
    perf.logRender('deleteAlarm');
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
              const updatedAlarms = cachedAlarms.filter(a => a.id !== alarm.id);
              console.log(`Filtered alarms from ${cachedAlarms.length} to ${updatedAlarms.length}`);
              
              // Update cached alarms
              saveCachedAlarms(updatedAlarms);
              
              // If we're deleting the selected alarm, clear the selection
              if (selectedAlarm && selectedAlarm.id === alarm.id) {
                console.log("Deleted alarm was the selected alarm, clearing selection");
                setSelectedAlarm(null);
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
  }, [cachedAlarms, selectedAlarm, saveCachedAlarms]);

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

  // Render the clock - this is now using our memoized Clock component
  const renderClock = useCallback(() => {
    return <Clock time={currentTime} />;
  }, [currentTime]);

  // Render alarm list item - using optimized memoized component
  const renderAlarmItem = useCallback(({ item }: { item: Alarm }) => {
    return (
      <AlarmItem 
        item={item} 
        onToggle={toggleAlarmActive} 
        onDelete={deleteAlarm}
        formatAlarmTime={formatAlarmTime}
        getFormattedDays={getFormattedDays}
      />
    );
  }, [toggleAlarmActive, deleteAlarm, formatAlarmTime, getFormattedDays]);

  // Empty list component optimized with useMemo
  const EmptyListComponent = useMemo(() => (
    <View style={styles.alarmBox}>
      <Text style={styles.noAlarmText}>NO ALARMS SET</Text>
    </View>
  ), []);

  // Optimization for list header component
  const ListHeaderComponent = useMemo(() => (
    <Text style={styles.sectionTitle}>ALARMS</Text>
  ), []);

  // Render alarm list section
  const renderAlarmList = useCallback(() => {
    perf.logRender('renderAlarmList');
    if (!cachedAlarms || cachedAlarms.length === 0) {
      return EmptyListComponent;
    }
    
    return (
      <View style={styles.alarmListContainer}>
        {ListHeaderComponent}
        <VirtualizedList
          data={cachedAlarms}
          renderItem={renderAlarmItem}
          keyExtractor={(item) => item.id}
          style={styles.alarmList}
          contentContainerStyle={styles.alarmListContent}
          showsVerticalScrollIndicator={false}
          itemHeight={70} // Fixed item height for virtualization
          onMomentumScrollEnd={(e) => {
            // Any scroll end logic here
          }}
          onScrollToIndexFailed={(info) => {
            console.warn('Failed to scroll to index:', info);
          }}
        />
      </View>
    );
  }, [cachedAlarms, renderAlarmItem, EmptyListComponent, ListHeaderComponent]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>{formattedTime}</Text>
        <View style={styles.battery}>
          <Text style={styles.signal}>{Icons.signal}</Text>
          <Text style={{color: "#a4e4a2", fontSize: 16, fontFamily: 'Doto'}}>{Icons.battery}</Text>
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
      
      <SafeTouchableOpacity 
        style={styles.addButton}
        onPress={navigateToAlarmScreen}
        activeOpacity={0.7}
      >
        <Text style={{fontSize: 36, color: "#000", fontFamily: 'Doto'}}>{Icons.add}</Text>
      </SafeTouchableOpacity>
    </SafeAreaView>
  );
}