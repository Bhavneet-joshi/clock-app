import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';

interface SafeTouchableOpacityProps extends TouchableOpacityProps {
  pointerEventsMode?: 'auto' | 'none' | 'box-none' | 'box-only';
}

/**
 * A TouchableOpacity component that properly handles pointerEvents
 * by ensuring it's applied in style instead of as a direct prop
 */
const SafeTouchableOpacity: React.FC<SafeTouchableOpacityProps> = ({
  pointerEventsMode,
  style,
  children,
  ...rest
}) => {
  const combinedStyle = pointerEventsMode
    ? [{ pointerEvents: pointerEventsMode }, style]
    : style;

  return (
    <TouchableOpacity style={combinedStyle} {...rest}>
      {children}
    </TouchableOpacity>
  );
};

export default SafeTouchableOpacity; 