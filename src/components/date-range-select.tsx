import React from 'react';
import {
  View
} from 'react-native';
import { DateToFront } from '../utils/dateUtils';
import { DateInput } from './date-input';
import Label from './label';

type DateRangeSelectProps = {
  placeholder?: string;
  startValueLabel?: string;
  startValue: DateToFront;
  setStartValue: (startValue: DateToFront) => void;
  formatStartDescription?: (startValue: DateToFront) => string;
  endValueLabel?: string;
  endValue: DateToFront;
  setEndValue: (endValue: DateToFront) => void;
  formatEndDescription?: (endValue: DateToFront) => string;
  minValue?: DateToFront;
  maxValue?: DateToFront;
};

export default function DateRangeSelect({
  startValueLabel,
  startValue,
  setStartValue,
  formatStartDescription,
  endValueLabel,
  endValue,
  setEndValue,
  formatEndDescription,
  minValue,
  maxValue,
}: DateRangeSelectProps) {
  return (
    <View className="w-full">
      <View className="flex flex-row items-center justify-between gap-4 py-2 bg-white rounded-lg">
        <View className="flex flex-col flex-1 gap-1 ">
          {startValueLabel && <Label size='text-sm'>{startValueLabel}</Label>}
          <DateInput
            value={startValue}
            setValue={setStartValue}
            minValue={minValue}
            maxValue={endValue}
            formatValueDescription={formatStartDescription}
          />
        </View>
        <View className="flex flex-col flex-1 gap-1 ">
          {endValueLabel && <Label size='text-sm'>{endValueLabel}</Label>}
          <DateInput
            value={endValue}
            setValue={setEndValue}
            minValue={startValue}
            maxValue={maxValue}
            formatValueDescription={formatEndDescription}
          />
        </View>
      </View>
    </View>
  );
}
