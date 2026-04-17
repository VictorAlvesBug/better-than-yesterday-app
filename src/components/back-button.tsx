
import React from 'react';
import { Pressable } from 'react-native';
import useNavigation from '../hooks/useNavigation';
import Icon from './icon';

export default function BackButton() {
  const navigation = useNavigation();

  return (
    <Pressable
      className="flex items-center justify-center w-20 h-20"
      onPress={() => navigation.back()}
    >
      <Icon name="arrow-back-outline" size={24} color="white" />
    </Pressable>
  );
}
