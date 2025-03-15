import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#a4e4a2',
        tabBarInactiveTintColor: '#5a7d3b',
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#1a1a1a',
          height: 60,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontFamily: 'monospace',
          fontSize: 12,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Clock',
          tabBarIcon: ({ color }) => <Ionicons name="time" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alarm"
        options={{
          title: 'Alarm',
          tabBarIcon: ({ color }) => <Ionicons name="alarm" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Timer',
          tabBarIcon: ({ color }) => <Ionicons name="timer" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stopwatch"
        options={{
          title: 'Stopwatch',
          tabBarIcon: ({ color }) => <Ionicons name="stopwatch" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
