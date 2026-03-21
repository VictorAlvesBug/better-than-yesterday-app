import { getColor } from '@/types/color.type';
import React from 'react';
import {
  TextInput,
  View
} from 'react-native';

type InputProps = {
  placeholder?: string;
  value?: string | null;
  onChange: (value: string) => void;
};

export default function Input({
  placeholder = 'Selecione...',
  value,
  onChange,
}: InputProps) {
  return (
      <View style={{borderColor: getColor("gray-d")}} className="flex flex-row items-center justify-between w-full px-3 py-2 bg-white border rounded-lg">
        <TextInput
           className="flex-1 outline-none"
          placeholder={placeholder}
          placeholderTextColor={getColor("gray-7")}
          value={value || ""}
          onChangeText={onChange}
          multiline={true}
        />
      </View>
  );
}
