import React from 'react';
import { View } from 'react-native';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  return (
    <View className={`p-4 bg-white rounded-2xl shadow-md ${className || ''}`}>
      {children}
    </View>
  );
}
