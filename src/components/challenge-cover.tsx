import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

type ChallengeCoverProps = {
  uri?: string;
  className?: string;
  style?: StyleProp<ImageStyle>;
};

export default function ChallengeCover({ uri, className, style }: ChallengeCoverProps) {
  if (!uri)
    return null;

  return (
    <Image
      source={{ uri }}
      className={className}
      style={[{ width: '100%', height: 160, borderRadius: 16 }, style]}
    />
  );
}
