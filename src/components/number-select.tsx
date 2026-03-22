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
  const onDecrease = () => {
    if (minValue === undefined || value > minValue)
      setValue(value - 1);
  }
  const onIncrease = () => {
    if (maxValue === undefined || value < maxValue)
      setValue(value + 1);
  }

  return (
      <View style={{borderColor: getColor("gray-d")}} className="flex flex-row items-center justify-between w-full px-1 py-1 bg-white border rounded-lg">
        <Button color='gray-d' type="outline" action={onDecrease} className='w-8 h-10 p-0'>
          <Ionicons name="chevron-back-outline" size={16} color={getColor("gray-7")} />
        </Button>
        <Text className="text-lg outline-none">
          {value}
        </Text>
        <Button color='gray-d' type="outline" action={onIncrease} className='w-8 h-10 p-0'>
          <Ionicons name="chevron-forward-outline" size={16} color={getColor("gray-7")} />
        </Button>
      </View>
  );
}
