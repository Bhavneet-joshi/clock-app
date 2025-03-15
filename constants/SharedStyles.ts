import { StyleSheet } from 'react-native';

// Shared color palette
export const Colors = {
  background: '#000000',
  cardBackground: '#1c1c1e',
  primary: '#0a84ff',
  secondary: '#4cd964',
  accent: '#ff9500',
  danger: '#ff3b30',
  warning: '#ffcc00',
  text: {
    primary: '#ffffff',
    secondary: '#ebebf5',
    tertiary: '#8e8e93',
    disabled: '#666666',
  },
  border: '#333333',
};

// Shared styles for consistent UI across all pages
export const SharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  largeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  mediumText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  smallText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  captionText: {
    fontSize: 14,
    color: Colors.text.tertiary,
  },
  controlButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
  },
  dangerButton: {
    backgroundColor: Colors.danger,
  },
  warningButton: {
    backgroundColor: Colors.warning,
  },
  buttonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledText: {
    color: Colors.text.disabled,
  },
}); 