import { Pressable, Text } from 'react-native';

type ButtonProps = {
  children: React.ReactNode | string;
  action?: () => void;
  className?: string;
};

export function Button({ action = () => { }, children, className }: ButtonProps) {
  return (
    <Pressable
      className={`items-center justify-center bg-purple-200 border border-purple-700 rounded-2xl h-14 ${className || ''} px-3`}
      onPress={action}
    >
      {typeof children === 'string' ? (
        <Text className="font-semibold text-lg text-purple-700">{children}</Text>
      ) : (
        children
      )}
    </Pressable>

  );
}
