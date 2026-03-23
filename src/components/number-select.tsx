import { getColor } from '@/types/color.type';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Text,
  View
} from 'react-native';
import { Button } from './button';

type NumberSelectProps = {
  value: number;
  setValue: (value: number) => void;
  minValue?: number;
  maxValue?: number;
};

export default function NumberSelect({
  value,
  setValue,
  minValue,
  maxValue,
}: NumberSelectProps) {
  const canDecrease = () => minValue === undefined || value > minValue;
  const canIncrease = () => maxValue === undefined || value < maxValue;

  const onDecrease = () => {
    if (canDecrease())
      setValue(value - 1);
  }

  const onIncrease = () => {
    if (canIncrease())
      setValue(value + 1);
  }

  return (
      <View className="flex flex-row items-center justify-start w-full gap-6 px-1 py-1">
        <Button color='gray-d' action={onDecrease} className='w-8 h-8 p-0' disabled={!canDecrease()}>
          <Ionicons name="remove-outline" size={20} color={getColor("gray-7")} />
        </Button>
        <Text className="text-lg outline-none">
          {value}
        </Text>
        <Button color='gray-d' action={onIncrease} className='w-8 h-8 p-0' disabled={!canIncrease()}>
          <Ionicons name="add-outline" size={20} color={getColor("gray-7")} />
        </Button>
      </View>
  );
}
