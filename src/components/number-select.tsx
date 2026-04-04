import { getColor } from '@/types/color.type';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Text,
  View
} from 'react-native';
import { twMerge } from 'tailwind-merge';
import { Button } from './button';

type NumberSelectProps = {
  value: number;
  setValue: (value: number) => void;
  minValue?: number;
  maxValue?: number;
} & React.ComponentProps<typeof View>;

export default function NumberSelect({
  value,
  setValue,
  minValue,
  maxValue,
  className = '',
  ...rest
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

  console.log({value})

  return (
      <View 
        className={twMerge("flex flex-row items-center justify-start gap-6 px-1 py-1", className)}
        {...rest}>
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
