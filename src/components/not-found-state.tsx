import { getColor } from '@/types/color.type';
import React from 'react';
import { Text, View } from 'react-native';
import { Button } from './button';

type NotFoundStateProps = {
  title: string;
  description: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export default function NotFoundState({
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: NotFoundStateProps) {
  return (
    <View className="items-center justify-center flex-1 px-6">
      <Text style={{ color: getColor('black') }} className="text-2xl font-semibold text-center">
        {title}
      </Text>
      <Text style={{ color: getColor('gray-6') }} className="mt-2 text-base text-center">
        {description}
      </Text>
      {primaryLabel && onPrimary && (
        <Button action={onPrimary} className="w-full mt-6">
          {primaryLabel}
        </Button>
      )}
      {secondaryLabel && onSecondary && (
        <Button action={onSecondary} type="outline" className="w-full mt-3">
          {secondaryLabel}
        </Button>
      )}
    </View>
  );
}
