import { ColorName, getColor } from '@/types/color.type';
import React from 'react';
import { View } from 'react-native';

type ScreenLayoutProps = {
  header: React.ReactNode;
  children: React.ReactNode;
  backgroundColor?: ColorName;
};

export default function ScreenLayout({
  header,
  children,
  backgroundColor = 'gray-e',
}: ScreenLayoutProps) {
  return (
    <View className="flex-1" style={{ backgroundColor: getColor(backgroundColor) }}>
      {header}
      <View className="relative flex-1 overflow-visible">
        {children}
      </View>
    </View>
  );
}
