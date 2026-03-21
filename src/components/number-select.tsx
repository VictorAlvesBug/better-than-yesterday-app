import { getColor } from '@/types/common.type';
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
      <View style={{borderColor: getColor("light-secondary")}} className="w-full flex flex-row items-center justify-between px-3 py-2 bg-white border rounded-lg">
        <Button color='light-secondary' action={onDecrease}>
          <Ionicons name="chevron-back-outline" size={20} color={getColor("secondary")} />
        </Button>
        <Text style={{color: getColor("dark-gray")}} className="text-lg outline-none">
          {value}
        </Text>
        <Button color='light-secondary' action={onIncrease}>
          <Ionicons name="chevron-forward-outline" size={20} color={getColor("secondary")} />
        </Button>
      </View>
  );
}
