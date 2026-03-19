import { TextSize } from '@/types/common.type';
import React from 'react';
import {
  Text,
  View
} from 'react-native';
import { DateInput } from './date-input';

type DateRangeSelectProps = {
  label?: string;
  placeholder?: string;
  startValue: string;
  setStartValue: (value: string) => void;
  startValueLabel?: string;
  finishValue: string;
  setFinishValue: (value: string) => void;
  finishValueLabel?: string;
  minValue?: string;
  maxValue?: string;
  labelSize?: TextSize;
};

export default function DateRangeSelect({
  label,
  labelSize = "text-base",
  startValueLabel,
  startValue,
  setStartValue,
  finishValueLabel,
  finishValue,
  setFinishValue,
  minValue,
  maxValue,
}: DateRangeSelectProps) {
  return (
    <View className="w-full">
      {label && (
        <Text className={`mb-1 font-semibold text-gray-500 uppercase ${labelSize}`}>
          {label}
        </Text>
      )}
      <View className="flex flex-row items-center justify-between py-2 bg-white rounded-lg gap-4">
        <DateInput
          label={startValueLabel}
          labelSize='text-sm'
          value={startValue}
          setValue={setStartValue}
          minValue={minValue}
          maxValue={finishValue}
        />
        <DateInput
          label={finishValueLabel}
          labelSize='text-sm'
          value={finishValue}
          setValue={setFinishValue}
          minValue={startValue}
          maxValue={maxValue}
        />
      </View>
    </View>
  );
}
