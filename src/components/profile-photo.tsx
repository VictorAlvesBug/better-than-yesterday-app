import { getColor } from '@/types/common.type';
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
      style={{
        backgroundColor: getColor("violet"),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "100%",
        aspectRatio: 1,
        width: getSize(size)
      }} 
    >
      <Text className="text-base text-white font-semibold">{getInitials(name)}</Text>
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
