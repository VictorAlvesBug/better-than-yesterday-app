import { OnlyDefinedProperties } from '@/types/utility.type';
import React from 'react';
import {
  Text,
  View
} from 'react-native';
import { twMerge } from 'tailwind-merge';
import { range } from '../utils/numberUtils';
import { Button } from './button';
import Icon from './icon';

type AvailableValuesLimit<AvailableValue extends number> = {
  availableValues: readonly AvailableValue[];
  minValue?: never;
  maxValue?: never;
}

type MinAndMaxLimit<AvailableValue extends number> = {
  availableValues?: never;
  minValue: AvailableValue;
  maxValue: AvailableValue;
}

type NumberSelectProps<AvailableValue extends number> = {
  value: AvailableValue;
  setValue: (value: AvailableValue) => void;
}
  & (AvailableValuesLimit<AvailableValue> | MinAndMaxLimit<AvailableValue>)
  & React.ComponentProps<typeof View>;

export default function NumberSelect<AvailableValue extends number>({
  value,
  setValue,
  className = '',
  availableValues,
  minValue,
  maxValue,
  ...rest
}: NumberSelectProps<AvailableValue>) {
  const limits = getLimits(minValue, maxValue, availableValues);

  const canDecrease = () => value > limits.minValue;
  const canIncrease = () => value < limits.maxValue;

  const onDecrease = () => {
    if (canDecrease()){
      const index = limits.availableValues.indexOf(value) - 1;
      setValue(limits.availableValues[index]);
    }
  }

  const onIncrease = () => {
    if (canIncrease()){
      const index = limits.availableValues.indexOf(value) + 1;
      setValue(limits.availableValues[index]);
    }
  }

  return (
    <View
      className={twMerge("flex flex-row items-center justify-start gap-6 px-1 py-1", className)}
      {...rest}>
      <Button color='gray-d' action={onDecrease} className='w-8 h-8 p-0' disabled={!canDecrease()}>
        <Icon name="remove-outline" size={20} />
      </Button>
      <Text className="text-lg outline-none">
        {value}
      </Text>
      <Button color='gray-d' action={onIncrease} className='w-8 h-8 p-0' disabled={!canIncrease()}>
        <Icon name="add-outline" size={20} />
      </Button>
    </View>
  );
}

type LimitIntersection<AvailableValue extends number> =
  & OnlyDefinedProperties<AvailableValuesLimit<AvailableValue>>
  & OnlyDefinedProperties<MinAndMaxLimit<AvailableValue>>;

function getLimits<AvailableValue extends number>(
  minValue?: AvailableValue, 
  maxValue?: AvailableValue, 
  availableValues?: readonly AvailableValue[]
): LimitIntersection<AvailableValue> {
  const min = minValue !== undefined
    ? minValue
    : availableValues !== undefined
      ? Math.min(...availableValues)
      : -Infinity;

  const max = maxValue !== undefined
    ? maxValue
    : availableValues !== undefined
      ? Math.max(...availableValues)
      : Infinity;

  const available = minValue !== undefined && maxValue !== undefined
    ? range(minValue, maxValue)
    : availableValues !== undefined
      ? [...availableValues]
      : [];

  available.sort();

  return {
    minValue: min as AvailableValue,
    maxValue: max as AvailableValue,
    availableValues: available as AvailableValue[]
  }
}