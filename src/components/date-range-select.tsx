import React from 'react';
import {
  View
} from 'react-native';
import { DateOnly } from '../utils/dateUtils';
import { DateInput } from './date-input';
import Label from './label';

type DateRangeSelectProps = {
  placeholder?: string;
  startDateOnlyLabel?: string;
  startDateOnly: DateOnly;
  setStartDateOnly: (startDateOnly: DateOnly) => void;
  startDescription?: (startDateOnly: DateOnly) => string;
  endDateOnlyLabel?: string;
  endDateOnly: DateOnly;
  setEndDateOnly: (endDateOnly: DateOnly) => void;
  endDescription?: (endDateOnly: DateOnly) => string;
  minDateOnly?: DateOnly;
  maxDateOnly?: DateOnly;
};

export default function DateRangeSelect({
  startDateOnlyLabel,
  startDateOnly,
  setStartDateOnly,
  startDescription,
  endDateOnlyLabel,
  endDateOnly,
  setEndDateOnly,
  endDescription,
  minDateOnly,
  maxDateOnly,
}: DateRangeSelectProps) {
  return (
    <View className="w-full">
      <View className="flex flex-row items-center justify-between gap-4 py-2 bg-white rounded-lg">
        <View className="flex flex-col flex-1 gap-1 ">
          {startDateOnlyLabel && <Label size='text-sm'>{startDateOnlyLabel}</Label>}
          <DateInput
            dateOnly={startDateOnly}
            setDateOnly={setStartDateOnly}
            minDateOnly={minDateOnly}
            maxDateOnly={endDateOnly}
          />
          {startDescription && startDescription(startDateOnly)}
        </View>
        <View className="flex flex-col flex-1 gap-1 ">
          {endDateOnlyLabel && <Label size='text-sm'>{endDateOnlyLabel}</Label>}
          <DateInput
            dateOnly={endDateOnly}
            setDateOnly={setEndDateOnly}
            minDateOnly={startDateOnly}
            maxDateOnly={maxDateOnly}
          />
          {endDescription && endDescription(endDateOnly)}
        </View>
      </View>
    </View>
  );
}
