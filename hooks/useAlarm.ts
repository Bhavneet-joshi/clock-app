import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const ALARM_STORAGE_KEY = '@alarm_settings';

export interface AlarmSettings {
  hour: string;
  minute: string;
  sound: string;
  snooze: string;
  repeat: string;
}

export function useAlarm() {
  const [settings, setSettings] = useState<AlarmSettings>({
    hour: new Date().getHours().toString().padStart(2, '0'),
    minute: new Date().getMinutes().toString().padStart(2, '0'),
    sound: 'Default',
    snooze: '5 min',
    repeat: 'Once',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(ALARM_STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error loading alarm settings:', err);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: Partial<AlarmSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await AsyncStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
    } catch (err) {
      console.error('Error saving alarm settings:', err);
    }
  }, [settings]);

  const scheduleAlarm = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Please enable notifications to set alarms');
        return false;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();

      const now = new Date();
      const alarmTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        parseInt(settings.hour),
        parseInt(settings.minute)
      );

      if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Alarm',
          body: `It's ${settings.hour}:${settings.minute}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          sticky: true,
          vibrate: [0, 250, 250, 250],
          data: {
            alarmTime: alarmTime.toISOString(),
            snoozeTime: settings.snooze,
            repeatOption: settings.repeat,
          },
        },
        trigger: {
          date: alarmTime,
          repeats: settings.repeat !== 'Once',
        },
      });

      return true;
    } catch (err) {
      console.error('Error scheduling alarm:', err);
      setError('Failed to set alarm. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  const handleSnooze = useCallback(async () => {
    try {
      const snoozeMinutes = parseInt(settings.snooze);
      const snoozeTime = new Date(Date.now() + snoozeMinutes * 60000);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Snoozed Alarm',
          body: `Alarm snoozed for ${snoozeMinutes} minutes`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: snoozeTime,
        },
      });
    } catch (err) {
      console.error('Error setting snooze:', err);
    }
  }, [settings.snooze]);

  return {
    settings,
    isLoading,
    error,
    saveSettings,
    scheduleAlarm,
    handleSnooze,
  };
} 