import { useAuth } from '@/src/context/auth';
import React from 'react';
import { Button, Text, View } from 'react-native';

export default function LoginForm() {
  const { signIn } = useAuth();

  return (
    <View className="flex items-center justify-center flex-1">
      <Text className="text-lg text-gray-800">Login</Text>
      <Button title="Entrar com Google" onPress={() => signIn()} />
    </View>
  );
}
