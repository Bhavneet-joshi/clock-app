import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LCDStyles, LCDColors } from '@/constants/LCDStyles';

interface DayIndicatorsProps {
  activeDays: string[];
  size?: 'small' | 'large';
}

const DayIndicators: React.FC<DayIndicatorsProps> = ({
  activeDays = [],
  size = 'small',
}) => {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  return (
    <View style={styles.container}>
      {days.map((day) => {
        const isActive = activeDays.includes(day);
        return (
          <View 
            key={day} 
            style={[
              styles.dayIndicator,
              size === 'large' ? styles.largeDayIndicator : {},
              isActive ? styles.activeDayIndicator : styles.inactiveDayIndicator
            ]}
          >
            <Text 
              style={[
                styles.dayText,
                size === 'large' ? styles.largeDayText : {},
                isActive ? styles.activeDayText : {}
              ]}
            >
              {day.substring(0, size === 'large' ? 3 : 1)}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dayIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  largeDayIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontFamily: 'monospace',
    fontSize: 10,
    color: LCDColors.secondaryText,
    textTransform: 'uppercase',
  },
  largeDayText: {
    fontSize: 14,
  },
  activeDayText: {
    color: LCDColors.background,
  },
});

export default DayIndicators; 