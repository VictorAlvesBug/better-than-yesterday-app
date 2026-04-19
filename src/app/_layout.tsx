import { AuthProvider } from '@/src/context/auth';
import { Stack } from 'expo-router';
import React from 'react';
import Toast from "react-native-toast-message";

export default function AppLayout() {
  // TODO: Não alterar mais este arquivo
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <Toast />
    </AuthProvider>
  );
}
