import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { ProRunnerColors } from '@/constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ProRunnerColors.primary,
        tabBarInactiveTintColor: ProRunnerColors.textSecondary,
        headerShown: false,

        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: ProRunnerColors.background,
            borderTopColor: ProRunnerColors.surface,
            borderTopWidth: 1,
            paddingTop: 8,
            paddingBottom: 20,
            height: 88,
          },
          default: {
            backgroundColor: ProRunnerColors.background,
            borderTopColor: ProRunnerColors.surface,
            borderTopWidth: 1,
            paddingTop: 8,
            paddingBottom: 8,
            height: 70,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoje',
          tabBarIcon: ({ color }) => <Ionicons name="sunny" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plano',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progresso',
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person-circle" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
