import { ColorName, getColor, getLightColor, TextSize } from '@/types/common.type';
import { Pressable, Text } from 'react-native';
import { twMerge } from 'tailwind-merge';

type ButtonProps = {
  children: React.ReactNode | string;
  action?: () => void;
  className?: string;
  color?: ColorName;
  type?: 'default' | 'outline';
  textSize?: TextSize;
};



export function Button({ action = () => { }, children, className, color = "silver", type = "default", textSize = "text-lg" }: ButtonProps) {
  const colorSet = type === "default" 
    ? {
      text: getLightColor(color),
      border: getColor(color),
      background: getColor(color),
    } : {
      text: getColor(color),
      border: getColor(color),
      background: getLightColor(color),
    }

  return (
    <Pressable
      style={{
        backgroundColor: colorSet.background,
        borderColor: colorSet.border,
      }}
      onPress={action}
      className={twMerge(`items-center justify-center border rounded-2xl h-14 px-3`, className)}
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
