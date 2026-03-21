import React from 'react';
import {
  View
} from 'react-native';
import { DateInput } from './date-input';
import Label from './label';

type DateRangeSelectProps = {
  placeholder?: string;
  startValue: string;
  setStartValue: (value: string) => void;
  startValueLabel?: string;
  finishValue: string;
  setFinishValue: (value: string) => void;
  finishValueLabel?: string;
  minValue?: string;
  maxValue?: string;
};

export default function DateRangeSelect({
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
      <View className="flex flex-row items-center justify-between py-2 bg-white rounded-lg gap-4">
        <View className=" flex-1 flex flex-col gap-1">
          {startValueLabel && <Label size='text-sm'>{startValueLabel}</Label>}
          <DateInput
            value={startValue}
            setValue={setStartValue}
            minValue={minValue}
            maxValue={finishValue}
          /></View>
        <View className=" flex-1 flex flex-col gap-1">
          {finishValueLabel && <Label size='text-sm'>{finishValueLabel}</Label>}
          <DateInput
            value={finishValue}
            setValue={setFinishValue}
            minValue={startValue}
            maxValue={maxValue}
          /></View>
      </View>
    </View>
  );
}
