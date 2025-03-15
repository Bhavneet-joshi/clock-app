import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// LCD Digital Clock color palette
export const LCDColors = {
  background: '#000000',
  primaryText: '#a4e969', // bright green for main displays
  secondaryText: '#5a7d3b', // dimmer green for secondary elements
  inactiveText: '#2a3a1c', // very dim green for inactive elements
  accentRed: '#ff3b30', // red accent for alerts and indicators
  gridLines: '#1a1a1a', // subtle grid lines
  cardBackground: '#0a0a0a', // slightly lighter than background for cards
  activeElement: '#a4e969', // bright green for active elements
  inactiveElement: '#2a3a1c', // dim green for inactive elements
};

// Font family would ideally be a digital LCD font
// For this example, we'll use a monospace font which is available on most devices
const lcdFontFamily = 'monospace';

export const LCDStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LCDColors.background,
    paddingTop: 40,
  },
  mainTimeDisplay: {
    fontFamily: lcdFontFamily,
    fontSize: 80,
    color: LCDColors.primaryText,
    textAlign: 'center',
    letterSpacing: 2,
    fontWeight: '300',
  },
  secondaryTimeDisplay: {
    fontFamily: lcdFontFamily,
    fontSize: 40,
    color: LCDColors.primaryText,
    textAlign: 'center',
    letterSpacing: 2,
  },
  timeLabel: {
    fontFamily: lcdFontFamily,
    fontSize: 14,
    color: LCDColors.secondaryText,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  gridContainer: {
    borderWidth: 1,
    borderColor: LCDColors.gridLines,
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  horizontalRule: {
    height: 1,
    backgroundColor: LCDColors.gridLines,
    marginVertical: 10,
  },
  verticalRule: {
    width: 1,
    backgroundColor: LCDColors.gridLines,
    marginHorizontal: 10,
  },
  circleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: LCDColors.cardBackground,
    borderWidth: 1,
    borderColor: LCDColors.secondaryText,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCircleButton: {
    backgroundColor: LCDColors.primaryText,
  },
  buttonText: {
    fontFamily: lcdFontFamily,
    fontSize: 16,
    color: LCDColors.primaryText,
    textAlign: 'center',
  },
  activeButtonText: {
    color: LCDColors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  dayIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  activeDayIndicator: {
    backgroundColor: LCDColors.primaryText,
  },
  inactiveDayIndicator: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: LCDColors.secondaryText,
  },
  dayText: {
    fontFamily: lcdFontFamily,
    fontSize: 12,
    color: LCDColors.secondaryText,
    textTransform: 'uppercase',
  },
  activeDayText: {
    color: LCDColors.background,
  },
  progressBar: {
    height: 10,
    backgroundColor: LCDColors.inactiveElement,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: LCDColors.primaryText,
  },
  tickMarksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  tickMark: {
    width: 1,
    height: 10,
    backgroundColor: LCDColors.secondaryText,
  },
  majorTickMark: {
    height: 15,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  timePickerDigit: {
    fontFamily: lcdFontFamily,
    fontSize: 60,
    color: LCDColors.primaryText,
    width: 70,
    textAlign: 'center',
  },
  timePickerSeparator: {
    fontFamily: lcdFontFamily,
    fontSize: 60,
    color: LCDColors.primaryText,
    width: 20,
    textAlign: 'center',
  },
  timePickerLabel: {
    fontFamily: lcdFontFamily,
    fontSize: 14,
    color: LCDColors.secondaryText,
    textAlign: 'center',
    marginTop: 5,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: LCDColors.gridLines,
    backgroundColor: LCDColors.background,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  tabButtonText: {
    fontFamily: lcdFontFamily,
    fontSize: 12,
    color: LCDColors.secondaryText,
    marginTop: 5,
    textTransform: 'uppercase',
  },
  activeTabButtonText: {
    color: LCDColors.primaryText,
  },
  lcdCard: {
    backgroundColor: LCDColors.cardBackground,
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: LCDColors.secondaryText,
  },
  activeCard: {
    backgroundColor: LCDColors.primaryText,
  },
  cardText: {
    fontFamily: lcdFontFamily,
    fontSize: 24,
    color: LCDColors.primaryText,
  },
  activeCardText: {
    color: LCDColors.background,
  },
  gridBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
}); 