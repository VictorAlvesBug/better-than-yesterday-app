import { getColor, TextSize } from '@/types/common.type';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Text,
  View
} from 'react-native';
import { Button } from './button';

type NumberSelectProps = {
  label?: string;
  labelSize?: TextSize;
  value: number;
  setValue: (value: number) => void;
  minValue?: number;
  maxValue?: number;
};

export default function NumberSelect({
  label,
  labelSize = "text-base",
  value,
  setValue,
  minValue,
  maxValue,
}: NumberSelectProps) {
  const onDecrease = () => {
    if (minValue === undefined || value > minValue)
      setValue(value - 1);
  }
  const onIncrease = () => {
    if (maxValue === undefined || value < maxValue)
      setValue(value + 1);
  }

  return (
    <View className="w-full">
      {label && (
        <Text className={`mb-1 font-semibold text-gray-500 uppercase ${labelSize}`}>
          {label}
        </Text>
      )}
      <View className="flex flex-row items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg">
        <Button color={"secondary"} action={onDecrease}>
          <Ionicons name="chevron-back-outline" size={20} color={getColor("secondary").base} />
        </Button>
        <Text className="text-lg text-gray-800 outline-none">
          {value}
        </Text>
        <Button color={"secondary"} action={onIncrease}>
          <Ionicons name="chevron-forward-outline" size={20} color={getColor("secondary").base} />
        </Button>
      </View>
    </View>
  );
}
