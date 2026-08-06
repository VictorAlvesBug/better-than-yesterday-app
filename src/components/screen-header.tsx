import { getColor } from '@/types/color.type';
import Constants from 'expo-constants';
import React from 'react';
import { Text, View } from 'react-native';
import { twMerge } from 'tailwind-merge';
import BackButton from './back-button';
import GradientView from './gradient-view';

type ScreenHeaderProps = {
  title?: string;
  titleSize?: 'text-lg' | 'text-xl';
  left?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export default function ScreenHeader({
  title,
  titleSize = 'text-xl',
  left,
  right,
  children,
  className,
}: ScreenHeaderProps) {
  return (
    <GradientView
      style={{ paddingTop: Constants.statusBarHeight }}
      className={twMerge('flex flex-col justify-center items-center w-full', className)}
    >
      <View className="flex flex-row items-center w-full">
        {left ?? <BackButton />}
        {title && (
          <Text
            style={{ color: getColor('white') }}
            className={twMerge('flex-1 font-bold text-left', titleSize)}
          >
            {title}
          </Text>
        )}
        {right ?? <View className="w-20 h-20" />}
      </View>
      {children}
    </GradientView>
  );
}
