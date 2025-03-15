import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LCDColors } from '@/constants/LCDStyles';

interface CircleButtonProps {
  onPress: () => void;
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'small' | 'medium' | 'large';
  active?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const CircleButton: React.FC<CircleButtonProps> = ({
  onPress,
  label,
  icon,
  size = 'medium',
  active = false,
  style,
  textStyle,
  disabled = false,
}) => {
  const getButtonSize = (): number => {
    switch (size) {
      case 'small':
        return 50;
      case 'medium':
        return 70;
      case 'large':
        return 90;
      default:
        return 70;
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 28;
      case 'large':
        return 36;
      default:
        return 28;
    }
  };

  const buttonSize = getButtonSize();
  const iconSize = getIconSize();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
        },
        active ? styles.activeButton : styles.inactiveButton,
        disabled ? styles.disabledButton : {},
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={iconSize}
          color={active ? LCDColors.background : LCDColors.primaryText}
        />
      )}
      {label && (
        <Text
          style={[
            styles.label,
            active ? styles.activeLabel : styles.inactiveLabel,
            disabled ? styles.disabledLabel : {},
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  activeButton: {
    backgroundColor: LCDColors.primaryText,
    borderColor: LCDColors.primaryText,
  },
  inactiveButton: {
    backgroundColor: LCDColors.background,
    borderColor: LCDColors.secondaryText,
  },
  disabledButton: {
    opacity: 0.5,
  },
  label: {
    fontFamily: 'monospace',
    fontSize: 14,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  activeLabel: {
    color: LCDColors.background,
  },
  inactiveLabel: {
    color: LCDColors.primaryText,
  },
  disabledLabel: {
    color: LCDColors.inactiveText,
  },
});

export default CircleButton; 