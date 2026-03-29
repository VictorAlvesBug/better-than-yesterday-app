import { ColorName, getColor } from '@/types/color.type';
import { IoniconsName } from '@/types/common.type';
import { Ionicons } from '@expo/vector-icons';
import React, { RefObject } from 'react';
import {
  TextInput,
  View
} from 'react-native';
import { twMerge } from 'tailwind-merge';
import { formatPhoneNumber } from '../utils/numberUtils';

type InputType = 'email' | 'nickname' | 'pix-key' | 'phone-number' | 'default';

type IconPosition = 'top' | 'right' | 'bottom' | 'left';

type WithIconProps = {
  icon: IoniconsName,
  iconPosition?: IconPosition;
  iconColor?: ColorName;
  iconSize?: number;
  iconAction?: () => void;
} | {
  icon?: never;
  iconPosition?: never;
  iconColor?: never;
  iconSize?: never;
  iconAction?: never;
}

type InputProps = {
  placeholder?: string;
  value?: string | null;
  onChange?: (value: string) => void;
  className?: string;
  ref?: RefObject<TextInput | null>;
  typeable?: boolean;
  grayBackground?: boolean;
  inputType?: InputType;
} & WithIconProps;

export default function Input({
  placeholder = '',
  value,
  onChange = () => {},
  className,
  ref,
  icon,
  iconPosition = 'left',
  iconColor = 'gray-7',
  iconSize = 18,
  iconAction = () => {},
  inputType = 'default',
  typeable = true,
  grayBackground = false,
}: InputProps) {
  return (
    <View
      style={{
        borderColor: getColor("gray-d"),
        backgroundColor: getColor(grayBackground ? "gray-d" : "white"), 
        pointerEvents: typeable ? 'auto' : 'none'
      }}
      className={
        twMerge(
          'flex items-center justify-center gap-2 w-full px-3 bg-white border rounded-lg',
          getOrientationClass(iconPosition),
          className
        )
      }>
      <TextInput
          ref={ref}
          className="flex-1 outline-none"
          placeholder={placeholder}
          placeholderTextColor={getColor("gray-7")}
          value={value || ""}
          multiline={false}
          onChangeText={onChange}
          {...getKeyboardTypeProps(inputType, onChange)}
        />
      {
        icon && <Ionicons onPress={iconAction} name={icon} size={iconSize} color={getColor(iconColor)} />
      }
    </View>
  );
}

function getOrientationClass(iconPosition: IconPosition) {
  switch (iconPosition) {
    case 'top':
      return 'flex-col-reverse';

    case 'right':
      return 'flex-row';

    case 'bottom':
      return 'flex-col';

    case 'left':
    default:
      return 'flex-row-reverse';
  }
}

function getKeyboardTypeProps(
  inputType: InputType,
  onChange: InputProps['onChange'] = () => {}): React.ComponentProps<typeof TextInput> {
  switch (inputType) {
    case 'email':
      return {
        onChangeText: (text) => onChange(text.replace(/[^a-zA-Z0-9@._%+\-]/g, '')),
        keyboardType: 'email-address',
        autoComplete: 'email',
        textContentType: 'emailAddress'
      };

    case 'nickname':
      return {
        keyboardType: 'default',
        autoComplete: 'nickname',
        textContentType: 'nickname'
      };

    case 'pix-key':
      return {
        onChangeText: (text) => onChange(text.replace(/[^A-Za-z0-9\-\.\/@_+]/g, '')),
        keyboardType: 'default',
      };

    case 'phone-number':
      return {
        onChangeText: (text) => onChange(formatPhoneNumber(text)),
        keyboardType: 'phone-pad',
        autoComplete: 'tel',
        textContentType: 'telephoneNumber',
        maxLength: 15
      };

    case 'default':
    default:
      return {
        keyboardType: 'default'
      };
  }
}