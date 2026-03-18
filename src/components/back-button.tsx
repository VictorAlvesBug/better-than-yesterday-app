import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';

export default function BackButton() {
  const router = useRouter();

  return (
    <Pressable
      className="flex items-center justify-center w-20 h-20"
      onPress={() => router.back()}
    >
      <Ionicons name="arrow-back-outline" size={24} color="#fff" />
    </Pressable>
  );
}
