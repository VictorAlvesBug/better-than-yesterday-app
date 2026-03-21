import { getColor } from '@/types/common.type';
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
      <View style={{borderColor: getColor("light-secondary")}} className="w-full flex flex-row items-center justify-between px-3 py-2 bg-white border rounded-lg">
        <TextInput
           style={{ color: getColor("dark-gray") }}
           className="flex-1 outline-none"
          placeholder={placeholder}
          placeholderTextColor={getColor("light-gray")}
          value={value || ""}
          onChangeText={onChange}
          multiline={true}
        />
      </View>
  );
}
