import React, { lazy, Suspense } from 'react';
import { Tabs } from 'expo-router';
import { Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Create a loader component for tab suspense
const TabLoader = () => (
  <View style={styles.loader}>
    <ActivityIndicator size="large" color="#a4e4a2" />
    <Text style={styles.loaderText}>Loading...</Text>
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#a4e4a2',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#222',
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: 'monospace',
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'CLOCK',
          tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alarm"
        options={{
          title: 'ALARM',
          tabBarIcon: ({ color }) => <Ionicons name="alarm-outline" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: 'TIMER',
          tabBarIcon: ({ color }) => <Ionicons name="timer-outline" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stopwatch"
        options={{
          title: 'STOPWATCH',
          tabBarIcon: ({ color }) => <Ionicons name="stopwatch-outline" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#a4e4a2',
    marginTop: 10,
    fontFamily: 'monospace',
  },
});
