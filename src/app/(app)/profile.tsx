import React from 'react';
import { Text, View } from 'react-native';

export default function Profile() {
  return (
    <View className="flex-1 bg-slate-100 items-center justify-center px-6">
      <Text className="text-2xl font-bold text-gray-800">Perfil</Text>
      <Text className="text-sm text-gray-500 mt-2">Em desenvolvimento...</Text>
    </View>
  );
}
