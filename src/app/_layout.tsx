import { AuthProvider } from '@/src/context/auth';
import { getColor } from '@/types/color.type';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function AppLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(getColor('violet'));
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
