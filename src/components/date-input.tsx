import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { DateOnly, getDate, getDateOnly } from '../utils/dateUtils';
import Input from './input';

type DateInputProps = {
  dateOnly: DateOnly;
  setDateOnly: (date: DateOnly) => void;
  minDateOnly?: DateOnly;
  maxDateOnly?: DateOnly;
};

export function DateInput({ dateOnly, setDateOnly, minDateOnly, maxDateOnly }: DateInputProps) {
  const [, setDate] = useState<Date>(getDate(dateOnly));
  const [show, setShow] = useState(false);

  const onChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed') {
      setShow(false);
      return;
    }
    const currentDate = selected || getDate(dateOnly);
    setShow(false);
    setDate(currentDate);
    setDateOnly(getDateOnly(currentDate));
  };

  const openPicker = () => {
    setShow(true);
  };

  return (
    <View className="flex-1">
      <Pressable
        onPress={openPicker}
      >
        <Input
          className="flex-1 outline-none pointer-events-none"
          value={dateOnly}
          onChange={() => {}}
          icon='calendar-clear-outline'
          iconPosition='right'
          typeable={false}
          />
      </Pressable>

      {show && (
        <DateTimePicker
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          value={getDate(dateOnly)}
          onChange={onChange}
          locale="pt-BR"
          minimumDate={minDateOnly ? getDate(minDateOnly) : undefined}
          maximumDate={maxDateOnly ? getDate(maxDateOnly) : undefined}
        />
      )}
    </View>
  );
}
