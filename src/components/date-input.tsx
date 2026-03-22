import { getColor } from '@/types/color.type';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { formatDate, rawDate } from '../utils/dateUtils';
import Input from './input';

type DateInputProps = {
  value: string;
  setValue: (value: string) => void;
  minValue?: string;
  maxValue?: string;
};

export function DateInput({ value, setValue, minValue, maxValue }: DateInputProps) {
  const [date, setDate] = useState<Date>(rawDate(value));
  const [show, setShow] = useState(false);

  const onChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed') {
      setShow(false);
      return;
    }
    const currentDate = selected || date;
    setShow(false);
    setDate(currentDate);
    setValue(formatDate(currentDate));
  };

  const openPicker = () => {
    setShow(true);
  };

  return (
    <View className="flex-1">
      <Pressable
        className="relative"
        onPress={openPicker}
      >
        <Input
          className="flex-1 outline-none pointer-events-none"
          value={value}
          onChange={() => {}}
          // onPress={() => setShow(true)}
          />
        <FontAwesome5 name="calendar" size={16} color={getColor("gray-7")} className='absolute right-0 m-3' />
      </Pressable>

      {show && (
        <DateTimePicker
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          value={date}
          onChange={onChange}
          locale="pt-BR"
          minimumDate={minValue ? rawDate(minValue) : undefined}
          maximumDate={maxValue ? rawDate(maxValue) : undefined}
        />
      )}
    </View>
  );
}
