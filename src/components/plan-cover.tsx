import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

type PlanCoverProps = {
  uri?: string;
  className?: string;
  style?: StyleProp<ImageStyle>;
};

export default function PlanCover({ uri, className, style }: PlanCoverProps) {
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
