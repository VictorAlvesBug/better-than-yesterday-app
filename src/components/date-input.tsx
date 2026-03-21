import { getColor } from '@/types/color.type';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';
import { formatDate, rawDate } from '../utils/dateUtils';

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
      <Pressable style={{borderColor: getColor("gray-d")}} className="flex flex-row items-center justify-between px-3 py-2 bg-white border rounded-lg"
        onPress={openPicker}>
        <TextInput
          className="flex-1 outline-none"
          value={value}
          editable={false}
          onPress={() => setShow(true)}
        />
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
