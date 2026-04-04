import { getColor } from '@/types/color.type';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { DateToFront, getDate, getDateToFront } from '../utils/dateUtils';
import Input from './input';

type DateInputProps = {
  value: DateToFront;
  setValue: (date: DateToFront) => void;
  minValue?: DateToFront;
  maxValue?: DateToFront;
  formatValueDescription?: (value: DateToFront) => string;
};

export function DateInput({
  value,
  setValue,
  minValue,
  maxValue,
  formatValueDescription
}: DateInputProps) {
  const [, setDate] = useState<Date>(getDate(value));
  const [show, setShow] = useState(false);

  const onChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed') {
      setShow(false);
      return;
    }
    const currentDate = selected || getDate(value);
    setShow(false);
    setDate(currentDate);
    setValue(getDateToFront(currentDate));
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
          value={value}
          onChange={() => { }}
          icon='calendar-clear-outline'
          iconPosition='right'
          typeable={false}
        />
        {
          formatValueDescription && 
          <Text style={{ color: getColor('gray-7') }} className='px-2 py-1 text-xs'>
            {formatValueDescription(value)}
          </Text>
        }
      </Pressable>

      {show && (
        <DateTimePicker
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          value={getDate(value)}
          onChange={onChange}
          locale="pt-BR"
          minimumDate={minValue ? getDate(minValue) : undefined}
          maximumDate={maxValue ? getDate(maxValue) : undefined}
        />
      )}
    </View>
  );
}
