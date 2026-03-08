import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function LoadingScreen() {
  return (
    <View className="items-center justify-center flex-1">
      <ActivityIndicator />
    </View>
  );
}
