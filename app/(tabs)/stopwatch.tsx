import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StopwatchScreen() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const [showColons, setShowColons] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const accumulatedTimeRef = useRef(0);

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

  const startStopwatch = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - accumulatedTimeRef.current;
      
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    }
  };

  const pauseStopwatch = () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
      accumulatedTimeRef.current = time;
      setIsRunning(false);
    }
  };

  const resetStopwatch = () => {
    clearInterval(intervalRef.current);
    setTime(0);
    setLaps([]);
    setIsRunning(false);
    accumulatedTimeRef.current = 0;
  };

  const addLap = () => {
    if (isRunning) {
      const lapTime = time;
      const previousLapTime = laps.length > 0 ? laps[0].time : 0;
      const lapDifference = lapTime - previousLapTime;
      
      setLaps([
        { id: Date.now(), time: lapTime, lapTime: lapDifference },
        ...laps
      ]);
    }
  };

  // Format milliseconds to HH:MM:SS.ms
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const ms = Math.floor((milliseconds % 1000) / 10);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      ms: ms.toString().padStart(2, '0')
    };
  };

  // Custom digital time display component
  const renderDigitalTimeDisplay = () => {
    const formattedTime = formatTime(time);
    
    return (
      <View style={styles.digitalTimeDisplay}>
        <Text style={styles.digitalTimeText}>
          {formattedTime.hours}
          <Text style={showColons ? styles.colonVisible : styles.colonHidden}>:</Text>
          {formattedTime.minutes}
          <Text style={showColons ? styles.colonVisible : styles.colonHidden}>:</Text>
          {formattedTime.seconds}
          <Text style={styles.msText}>.{formattedTime.ms}</Text>
        </Text>
      </View>
    );
  };

  // Custom circle button component
  const renderCircleButton = ({ icon, size, active, onPress, disabled }) => {
    const buttonSize = size === 'large' ? 70 : 50;
    
    return (
      <TouchableOpacity
        style={[
          styles.circleButton,
          { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
          active && styles.activeCircleButton,
          disabled && styles.disabledButton
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <Ionicons 
          name={icon} 
          size={size === 'large' ? 30 : 24} 
          color={active ? '#000' : '#a4e4a2'} 
        />
      </TouchableOpacity>
    );
  };

  // Render a lap item
  const renderLapItem = ({ item, index }) => {
    const formattedLapTime = formatTime(item.lapTime);
    const formattedTotalTime = formatTime(item.time);
    
    // Find fastest and slowest laps
    const lapTimes = laps.map(lap => lap.lapTime);
    const fastestLapTime = Math.min(...lapTimes);
    const slowestLapTime = Math.max(...lapTimes);
    
    let lapStyle = styles.normalLap;
    if (laps.length > 1) {
      if (item.lapTime === fastestLapTime) {
        lapStyle = styles.fastestLap;
      } else if (item.lapTime === slowestLapTime) {
        lapStyle = styles.slowestLap;
      }
    }
    
    return (
      <View style={styles.lapItem}>
        <Text style={styles.lapNumber}>LAP {laps.length - index}</Text>
        <Text style={[styles.lapTime, lapStyle]}>
          {formattedLapTime.minutes}:{formattedLapTime.seconds}.{formattedLapTime.ms}
        </Text>
        <Text style={styles.totalTime}>
          {formattedTotalTime.minutes}:{formattedTotalTime.seconds}.{formattedTotalTime.ms}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>{currentTime.getHours()}:{currentTime.getMinutes().toString().padStart(2, '0')}</Text>
        <View style={styles.battery}>
          <Text style={styles.signal}>●●●●</Text>
          <Text style={styles.wifi}>▲</Text>
          <Text style={styles.batt}>■</Text>
        </View>
      </View>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>STOPWATCH</Text>
      </View>
      
      <View style={styles.mainTimeContainer}>
        <View style={styles.currentTimeDisplay}>
          {renderDigitalTimeDisplay()}
        </View>
      </View>
      
      <View style={styles.lapsContainer}>
        <FlatList
          data={laps}
          renderItem={renderLapItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.lapsList}
          ListEmptyComponent={
            <Text style={styles.emptyLapsText}>
              Laps will appear here
            </Text>
          }
        />
      </View>
      
      <View style={styles.controlsContainer}>
        {!isRunning ? (
          <>
            {renderCircleButton({
              icon: "refresh",
              size: "medium",
              active: false,
              onPress: resetStopwatch,
              disabled: time === 0
            })}
            {renderCircleButton({
              icon: "play",
              size: "large",
              active: true,
              onPress: startStopwatch,
              disabled: false
            })}
            {renderCircleButton({
              icon: "flag",
              size: "medium",
              active: false,
              onPress: addLap,
              disabled: time === 0
            })}
          </>
        ) : (
          <>
            {renderCircleButton({
              icon: "flag",
              size: "medium",
              active: false,
              onPress: addLap,
              disabled: false
            })}
            {renderCircleButton({
              icon: "pause",
              size: "large",
              active: true,
              onPress: pauseStopwatch,
              disabled: false
            })}
            {renderCircleButton({
              icon: "stop",
              size: "medium",
              active: false,
              onPress: resetStopwatch,
              disabled: false
            })}
          </>
        )}
      </View>
      
      <View style={styles.homeBar} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  statusTime: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  battery: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  signal: {
    color: 'white',
    fontSize: 12,
  },
  wifi: {
    color: 'white',
    fontSize: 12,
  },
  batt: {
    color: 'white',
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTitle: {
    fontFamily: 'monospace',
    fontSize: 24,
    color: '#a4e4a2',
    letterSpacing: 2,
  },
  mainTimeContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  currentTimeDisplay: {
    marginBottom: 20,
  },
  digitalTimeDisplay: {
    alignItems: 'center',
  },
  digitalTimeText: {
    fontFamily: 'monospace',
    fontSize: 60,
    color: '#a4e4a2',
    letterSpacing: 2,
  },
  msText: {
    fontSize: 40,
  },
  colonVisible: {
    opacity: 1,
  },
  colonHidden: {
    opacity: 0.3,
  },
  lapsContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  lapsList: {
    paddingBottom: 20,
  },
  lapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  lapNumber: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#5a7d3b',
    width: '25%',
  },
  lapTime: {
    fontFamily: 'monospace',
    fontSize: 16,
    color: '#a4e4a2',
    width: '35%',
    textAlign: 'center',
  },
  totalTime: {
    fontFamily: 'monospace',
    fontSize: 16,
    color: '#5a7d3b',
    width: '35%',
    textAlign: 'right',
  },
  normalLap: {
    color: '#a4e4a2',
  },
  fastestLap: {
    color: '#4cd964',
  },
  slowestLap: {
    color: '#ff3b30',
  },
  emptyLapsText: {
    fontFamily: 'monospace',
    fontSize: 16,
    color: '#5a7d3b',
    textAlign: 'center',
    marginTop: 30,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  circleButton: {
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a4e4a2',
  },
  activeCircleButton: {
    backgroundColor: '#a4e4a2',
  },
  disabledButton: {
    opacity: 0.5,
  },
  homeBar: {
    width: 120,
    height: 5,
    backgroundColor: '#a4e4a2',
    borderRadius: 3,
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
}); 