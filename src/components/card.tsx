import React from 'react';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  return (
    <View className={twMerge(`p-4 bg-white rounded-2xl shadow-md`, className)}>
      {children}
    </View>
  );
}
