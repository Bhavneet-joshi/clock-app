import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LCDStyles, LCDColors } from '@/constants/LCDStyles';

interface DigitalTimeDisplayProps {
  hours: string;
  minutes: string;
  seconds?: string;
  milliseconds?: string;
  label?: string;
  size?: 'large' | 'medium' | 'small';
  showColon?: boolean;
}

const DigitalTimeDisplay: React.FC<DigitalTimeDisplayProps> = ({
  hours,
  minutes,
  seconds,
  milliseconds,
  label,
  size = 'large',
  showColon = true,
}) => {
  const getTimeStyle = () => {
    switch (size) {
      case 'large':
        return styles.largeTime;
      case 'medium':
        return styles.mediumTime;
      case 'small':
        return styles.smallTime;
      default:
        return styles.largeTime;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, getTimeStyle()]}>
          {hours}
          <Text style={showColon ? styles.colonVisible : styles.colonHidden}>:</Text>
          {minutes}
          {seconds && (
            <>
              <Text style={showColon ? styles.colonVisible : styles.colonHidden}>:</Text>
              {seconds}
            </>
          )}
          {milliseconds && (
            <>
              <Text style={styles.decimal}>.</Text>
              {milliseconds}
            </>
          )}
        </Text>
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontFamily: 'monospace',
    color: LCDColors.primaryText,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  largeTime: {
    fontSize: 80,
  },
  mediumTime: {
    fontSize: 48,
  },
  smallTime: {
    fontSize: 32,
  },
  colonVisible: {
    opacity: 1,
  },
  colonHidden: {
    opacity: 0,
  },
  decimal: {
    color: LCDColors.primaryText,
  },
  label: {
    ...LCDStyles.timeLabel,
    marginTop: 5,
  },
});

export default DigitalTimeDisplay; 