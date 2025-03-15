import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
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
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
    fontSize: 14,
  },
  battery: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signal: {
    color: '#a4e4a2',
    fontSize: 10,
    marginRight: 5,
  },
  clockContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainTime: {
    color: '#a4e4a2',
    fontSize: 72,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
    letterSpacing: 2,
  },
  colon: {
    color: '#a4e4a2',
  },
  colonHidden: {
    opacity: 0,
  },
  seconds: {
    fontSize: 36,
    color: '#a4e4a2',
  },
  nextAlarmContainer: {
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(164, 228, 162, 0.1)',
    borderRadius: 8,
  },
  nextAlarmText: {
    color: '#a4e4a2',
    fontSize: 16,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
    textAlign: 'center',
  },
  progressLine: {
    height: 20,
    width: 1,
    marginHorizontal: 1,
  },
  dayText: {
    color: '#666',
    fontSize: 14,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
    marginHorizontal: 5,
  },
  currentDayText: {
    color: '#a4e4a2',
  },
  activeDayText: {
    color: '#a4e4a2',
    opacity: 0.8,
  },
  alarmListContainer: {
    flex: 1,
    marginTop: 20,
  },
  sectionTitle: {
    color: '#a4e4a2',
    fontSize: 18,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
    marginBottom: 10,
  },
  alarmList: {
    flex: 1,
  },
  alarmListContent: {
    paddingBottom: 80, // Space for the add button
  },
  alarmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'rgba(164, 228, 162, 0.05)',
    borderRadius: 10,
    marginBottom: 10,
  },
  alarmTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alarmTime: {
    color: '#a4e4a2',
    fontSize: 24,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
  },
  alarmDetailsContainer: {
    flex: 1,
    marginLeft: 15,
  },
  songTitle: {
    color: '#a4e4a2',
    fontSize: 16,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
  },
  alarmDays: {
    color: '#666',
    fontSize: 12,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
    marginTop: 5,
  },
  inactiveAlarmTime: {
    color: '#666',
    opacity: 0.7,
  },
  inactiveAlarmText: {
    color: '#666',
    opacity: 0.7,
  },
  alarmBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(164, 228, 162, 0.05)',
    borderRadius: 10,
    marginTop: 20,
  },
  noAlarmText: {
    color: '#666',
    fontSize: 16,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    marginLeft: 10,
  },
  toggleButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#a4e4a2',
    justifyContent: 'center',
    alignItems: 'center',
    // Platform-specific shadow handling
    ...(Platform.OS === 'web' 
      ? { 
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' 
        } 
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 4,
        }
    ),
  }
}); 