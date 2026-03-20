import { ColorKey, ColorSet, getColorSet } from '@/types/common.type';
import { Pressable, Text } from 'react-native';

type ButtonProps = {
  children: React.ReactNode | string;
  action?: () => void;
  className?: string;
  color?: ColorKey | ColorSet;
};



export function Button({ action = () => { }, children, className, color = "accent" }: ButtonProps) {
  const colorSet = getColorSet(color);

  return (
    <Pressable
      style={{
        backgroundColor: colorSet.backgroundLight,
        borderColor: colorSet.borderBase,
      }}
      onPress={action}
      className={`items-center justify-center border rounded-2xl h-14 ${className || ''} px-3`}
    >
      {typeof children === 'object' ? (
        children
      ) : (
        <Text 
        style={{
          color: colorSet.textBase,
        }}
          className={`font-semibold text-lg`}>{children}</Text>
      )}
    </Pressable>

  );
}
