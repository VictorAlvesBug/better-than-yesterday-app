import { useAuth } from '@/src/context/auth';
import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function AppLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  // Se não estiver logado, redireciona para /
  if (!user) {
    return <Redirect href="/" />;
  }

  // Se logado, mostra o conteúdo protegido
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
