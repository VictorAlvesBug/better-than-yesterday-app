import { ColorName, getColor } from '@/types/color.type';
import { IoniconsName } from '@/types/common.type';
import { Ionicons } from '@expo/vector-icons';
import React, { RefObject } from 'react';
import {
  TextInput,
  View
} from 'react-native';
import { twMerge } from 'tailwind-merge';

type WithIconProps = {
  icon: IoniconsName,
  iconPosition?: 'top' | 'right' | 'bottom' | 'left';
  iconColor?: ColorName;
  iconSize?: number;
} | {
  icon?: never;
  iconPosition?: never;
  iconColor?: never;
  iconSize?: never;
}

type InputProps = {
  placeholder?: string;
  value?: string | null;
  onChange: (value: string) => void;
  className?:  string;
  ref?: RefObject<TextInput | null>;
} & WithIconProps;

export default function Input({
  placeholder = 'Selecione...',
  value,
  onChange,
  className,
  ref,
  icon,
  iconPosition = 'left',
  iconColor = 'gray-7',
  iconSize = 18
}: InputProps) {
  let orientationClass = "";

  switch (iconPosition){
    case 'top':
      orientationClass = 'flex-col-reverse';
      break;

    case 'right':
      orientationClass = 'flex-row';
      break;

    case 'bottom':
      orientationClass = 'flex-col';
      break;

    case 'left':
    default:
      orientationClass = 'flex-row-reverse';
  }

  return (
    <View
      style={{ borderColor: getColor("gray-d") }}
      className={
        twMerge(
          'flex items-center justify-center gap-2 w-full px-3 bg-white border rounded-lg', 
          orientationClass, 
          className
          )
        }>
      <TextInput
        ref={ref}
        className="flex-1 outline-none"
        placeholder={placeholder}
        placeholderTextColor={getColor("gray-7")}
        value={value || ""}
        onChangeText={onChange}
        multiline={true}
        />
        {
          icon && <Ionicons name={icon} size={iconSize} color={getColor(iconColor)} />
        }
    </View>
  );
}
