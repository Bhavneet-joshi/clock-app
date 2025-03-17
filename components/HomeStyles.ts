import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  statusTime: {
    color: '#a4e4a2',
    fontSize: 15,
    fontFamily: 'Doto',
  },
  battery: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signal: {
    marginRight: 10,
    color: '#a4e4a2',
    fontSize: 12,
    fontFamily: 'Doto',
  },
  clockContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  mainTime: {
    color: '#fff',
    fontSize: 68,
    fontFamily: 'Doto',
    letterSpacing: 2,
  },
  colon: {
    color: '#a4e4a2',
  },
  colonHidden: {
    opacity: 0.3,
  },
  seconds: {
    fontSize: 48,
    color: '#a4e4a2',
    fontFamily: 'Doto',
  },
  nextAlarmContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  nextAlarmText: {
    color: '#a4e4a2',
    fontSize: 16,
    fontFamily: 'Doto',
  },
  alarmListContainer: {
    flex: 1,
    marginTop: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 16,
    fontFamily: 'Doto',
  },
  alarmList: {
    flex: 1,
  },
  alarmListContent: {
    paddingBottom: 80,
  },
  alarmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 16,
  },
  alarmTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
  },
  alarmTime: {
    color: '#fff',
    fontSize: 22,
    marginRight: 12,
    fontFamily: 'Doto',
  },
  alarmDetailsContainer: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
    fontFamily: 'Doto',
  },
  alarmDays: {
    color: '#a4e4a2',
    fontSize: 14,
    fontFamily: 'Doto',
  },
  inactiveAlarmText: {
    color: '#666',
  },
  toggleButton: {
    padding: 6,
  },
  deleteButton: {
    padding: 6,
  },
  alarmBox: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  noAlarmText: {
    color: '#666',
    fontSize: 18,
    fontFamily: 'Doto',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#a4e4a2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#a4e4a2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  progressLine: {
    height: 40,
    width: 2,
    backgroundColor: '#fff',
    marginHorizontal: 2,
  },
  dayText: {
    color: '#666',
    marginHorizontal: 4,
    fontSize: 13,
    fontFamily: 'Doto',
  },
  currentDayText: {
    color: '#fff',
  },
  activeDayText: {
    color: '#a4e4a2',
  },
}); 