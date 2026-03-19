import { TextSize } from '@/types/common.type';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { formatDate, rawDate } from '../utils/dateUtils';

type DateInputProps = {
  label?: string;
  labelSize?: TextSize;
  value: string;
  setValue: (value: string) => void;
  minValue?: string;
  maxValue?: string;
};

export function DateInput({ label, value, setValue, minValue, maxValue, labelSize = "text-base" }: DateInputProps) {
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
      {label && (
        <Text className={`mb-1 font-semibold text-gray-500 uppercase ${labelSize}`}>
          {label}
        </Text>
      )}
      <Pressable className="flex flex-row items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg"
        onPress={openPicker}>
        <TextInput
          className="flex-1 text-gray-800 outline-none"
          placeholderTextColor="#9ca3af"
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
