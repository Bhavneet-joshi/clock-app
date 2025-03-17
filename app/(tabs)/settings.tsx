import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

// Pixel-style icons for settings
const Icons = {
  sound: "♪",
  notification: "🔔",
  theme: "☀",
  about: "ℹ",
  reset: "↺",
};

export default function SettingsScreen() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);
  
  const resetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all settings to default?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: () => {
            setSoundEnabled(true);
            setNotifications(true);
            setDarkTheme(true);
            Alert.alert("Settings Reset", "All settings have been reset to default values.");
          } 
        }
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>SETTINGS</Text>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP SETTINGS</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>{Icons.sound} SOUND</Text>
              <Text style={styles.settingDescription}>Enable alarm and app sounds</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              thumbColor={soundEnabled ? '#a4e4a2' : '#767577'}
              trackColor={{ false: '#222', true: '#222' }}
              ios_backgroundColor="#222"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>{Icons.notification} NOTIFICATIONS</Text>
              <Text style={styles.settingDescription}>Enable alarm notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              thumbColor={notifications ? '#a4e4a2' : '#767577'}
              trackColor={{ false: '#222', true: '#222' }}
              ios_backgroundColor="#222"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>{Icons.theme} DARK THEME</Text>
              <Text style={styles.settingDescription}>Use dark theme</Text>
            </View>
            <Switch
              value={darkTheme}
              onValueChange={setDarkTheme}
              thumbColor={darkTheme ? '#a4e4a2' : '#767577'}
              trackColor={{ false: '#222', true: '#222' }}
              ios_backgroundColor="#222"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          
          <View style={styles.aboutItem}>
            <Text style={styles.aboutText}>{Icons.about} VERSION</Text>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
          
          <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
            <Text style={styles.resetButtonText}>{Icons.reset} RESET ALL SETTINGS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Doto',
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#a4e4a2',
    fontSize: 16,
    marginBottom: 16,
    fontFamily: 'Doto',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Doto',
  },
  settingDescription: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Doto',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  aboutText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Doto',
  },
  versionText: {
    color: '#888',
    fontSize: 14,
    fontFamily: 'Doto',
  },
  resetButton: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#ff5252',
    fontSize: 16,
    fontFamily: 'Doto',
  },
}); 