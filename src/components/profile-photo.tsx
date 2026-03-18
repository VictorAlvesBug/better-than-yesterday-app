import React from 'react';
import { Text, View } from 'react-native';
import { getInitials } from '../utils/stringUtils';

type ProfilePhotoProps = {
  name: string;
  size?: 'small' | 'large';
};

export default function ProfilePhoto({
  name,
  size = 'small',
}: ProfilePhotoProps) {
  return (
    <View
      className={`flex items-center justify-center bg-purple-700 rounded-full ${getClassesForSize(size)}`}
    >
      <Text className="text-base text-white">{getInitials(name)}</Text>
    </View>
  );
}

function getClassesForSize(size: ProfilePhotoProps['size']) {
  switch (size) {
    case 'large':
      return 'w-12 h-12';
    case 'small':
    default:
      return 'w-10 h-10';
  }
}
