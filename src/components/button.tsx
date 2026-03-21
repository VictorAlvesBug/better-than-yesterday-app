import { ColorName, getColor, getLightColor } from '@/types/color.type';
import { TextSize } from '@/types/common.type';
import { Pressable, Text } from 'react-native';
import { twMerge } from 'tailwind-merge';

type ColorNameSet = {
  text: ColorName,
  border: ColorName,
  background: ColorName,
}

type ColorSet = {
  text: string,
  border: string,
  background: string,
}

type WithColorNameProps = {
  color?: ColorName;
  type?: 'default' | 'outline';
}

type WithColorNameSetProps = {
  color: ColorNameSet;
  type?: never;
}

type ButtonProps = {
  children: React.ReactNode | string;
  action?: () => void;
  className?: string;
  textSize?: TextSize;
} & (WithColorNameProps
  | WithColorNameSetProps);

const defaultColor: ColorNameSet = {
  text: "gray-3",
  border: "gray-7",
  background: "gray-e",
};

export function Button({ action = () => { }, children, className, color = defaultColor, type = "default", textSize = "text-lg" }: ButtonProps) {
  const colorSet: ColorSet =
    typeof color === 'string'
      ? (type === "default"
        ? {
          text: getLightColor(color),
          border: getColor(color),
          background: getColor(color),
        } : {
          text: getColor(color),
          border: getColor(color),
          background: getLightColor(color),
        })
      : {
        text: getColor(color.text),
        border: getColor(color.border),
        background: getColor(color.background),
      };

  return (
    <Pressable
      style={{
        backgroundColor: colorSet.background,
        borderColor: colorSet.border,
      }}
      onPress={action}
      className={twMerge(`items-center justify-center border rounded-2xl px-3 h-14`, className)}
    >
      {typeof children === 'object' ? (
        children
      ) : (
        <Text
          style={{
            color: colorSet.text,
          }}
          className={`font-semibold ${textSize}`}>{children}</Text>
      )}
    </Pressable>

  );
}
