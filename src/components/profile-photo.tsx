import { getColor } from '@/types/color.type';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { getInitials } from '../utils/stringUtils';

type ProfilePhotoProps = {
  name: string;
  photoUrl?: string;
  size?: 'small' | 'large';
};

export default function ProfilePhoto({
  name,
  photoUrl,
  size = 'small',
}: ProfilePhotoProps) {
  const dimension = getSize(size);

  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={{
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: getColor('gray-d'),
        }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={{
        backgroundColor: getColor('violet'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: dimension / 2,
        width: dimension,
        height: dimension,
      }}
    >
      <Text className="text-base font-semibold text-white">{getInitials(name)}</Text>
    </View>
  );
}

function getSize(size: ProfilePhotoProps['size']) {
  switch (size) {
    case 'large':
      return 48;
    case 'small':
    default:
      return 40;
  }
}
