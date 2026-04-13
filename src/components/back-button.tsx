import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import Icon from './icon';

export default function BackButton() {
  const router = useRouter();

  return (
    <Pressable
      className="flex items-center justify-center w-20 h-20"
      onPress={() => router.back()}
    >
      <Icon name="arrow-back-outline" size={24} color="white" />
    </Pressable>
  );
}
