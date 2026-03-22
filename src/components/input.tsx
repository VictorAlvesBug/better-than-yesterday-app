import { getColor } from '@/types/color.type';
import React, { RefObject } from 'react';
import {
  TextInput,
  View
} from 'react-native';
import { twMerge } from 'tailwind-merge';

type InputProps = {
  placeholder?: string;
  value?: string | null;
  onChange: (value: string) => void;
  className?:  string;
  ref?: RefObject<TextInput | null>;
} /*& TextInputProps*/;

export default function Input({
  placeholder = 'Selecione...',
  value,
  onChange,
  className,
  ...rest
}: InputProps) {
  return (
    <View
      style={{ borderColor: getColor("gray-d") }}
      className={twMerge("flex flex-row items-center justify-between w-full px-3 bg-white border rounded-lg", className)}>
      <TextInput
        {...rest}
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
