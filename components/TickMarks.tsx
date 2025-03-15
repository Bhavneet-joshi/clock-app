import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LCDColors } from '@/constants/LCDStyles';

interface TickMarksProps {
  count: number;
  majorTickInterval?: number;
  progress?: number;
  height?: number;
}

const TickMarks: React.FC<TickMarksProps> = ({
  count,
  majorTickInterval = 5,
  progress = 0,
  height = 40,
}) => {
  return (
    <View style={[styles.container, { height }]}>
      {Array.from({ length: count }).map((_, index) => {
        const isMajorTick = index % majorTickInterval === 0;
        const isActive = index <= (progress * count);
        
        return (
          <View
            key={index}
            style={[
              styles.tick,
              isMajorTick ? styles.majorTick : {},
              isActive ? styles.activeTick : styles.inactiveTick,
              { height: isMajorTick ? height : height * 0.6 }
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  tick: {
    width: 1,
  },
  majorTick: {
    width: 2,
  },
  activeTick: {
    backgroundColor: LCDColors.primaryText,
  },
  inactiveTick: {
    backgroundColor: LCDColors.inactiveText,
  },
});

export default TickMarks; 