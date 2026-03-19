import React from 'react';
import {
  Text,
  TextInput,
  View
} from 'react-native';

type InputProps = {
  label?: string;
  placeholder?: string;
  value?: string | null;
  onChange: (value: string) => void;
};

export default function Input({
  label,
  placeholder = 'Selecione...',
  value,
  onChange,
}: InputProps) {
  return (
    <View className="w-full">
      {label && (
        <Text className="mb-1 text-sm font-semibold text-gray-500 uppercase">
          {label}
        </Text>
      )}
      <View className="flex flex-row items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg">
        <TextInput
          className="flex-1 text-gray-800 outline-none"
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value || ""}
          onChangeText={onChange}
          multiline={true}
        />
      </View>
    </View>
  );
}
