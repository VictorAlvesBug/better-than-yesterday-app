import { getColor } from '@/types/color.type';
import { IoniconsName } from '@/types/common.type';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export type RadioButtonOption = {
  value: string;
  icon?: IoniconsName;
  title: string;
  complement?: string;
}

type RadioButtonSelectProps = {
  selectedValue: string;
  onChange: (value: string) => void;
  options: RadioButtonOption[];
}

export default function RadioButtonSelect({
  selectedValue,
  onChange,
  options,
}: RadioButtonSelectProps) {
  return (<View className='flex flex-col justify-center w-full gap-3 item-center'>
    {
      options.map(({ value, icon, title, complement }) => {
        const isSelected = selectedValue === value;
        return (
          <Pressable
            key={value}
            style={{ borderColor: getColor(isSelected ? 'violet' : 'gray-d') }}
            onPress={() => onChange(value)}
            className='flex flex-row items-center justify-start w-full gap-3 px-4 py-4 border-2 rounded-xl'>
            <View
              style={{ borderColor: getColor(isSelected ? 'violet' : 'gray-d') }}
              className="flex items-center justify-center w-6 h-6 p-1 border-2 rounded-full">
              {
                isSelected
                && <View
                  style={{ backgroundColor: getColor('violet') }}
                  className="flex items-center justify-center w-full h-full rounded-full" />
              }
            </View>
            {
              icon
              && <Ionicons name={icon} size={18} color={getColor('gray-7')} />
            }
            <View className='flex flex-col items-start justify-center'>
              <Text className='text-base font-bold'>{title}</Text>
              {
                complement
                && <Text style={{ color: getColor('gray-7') }} className='text-sm font-bold'>
                  {complement}
                </Text>
              }
            </View>
          </Pressable>
        )
      })}
  </View>)
}