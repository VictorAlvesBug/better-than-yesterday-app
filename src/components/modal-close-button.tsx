import React from 'react';
import { Pressable } from 'react-native';
import Icon from './icon';

type ModalCloseButtonProps = {
  onPress: () => void;
};

export default function ModalCloseButton({ onPress }: ModalCloseButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      className="absolute z-10 items-center justify-center w-8 h-8 top-3 right-3"
    >
      <Icon name="times" size={22} color="gray-3" />
    </Pressable>
  );
}
