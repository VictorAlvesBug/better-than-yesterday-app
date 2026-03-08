import { Pressable, Text } from 'react-native';

type ButtonProps = {
  action?: () => void;
  children?: React.ReactNode | string;
  className?: string;
};

export function Button({ action, children, className }: ButtonProps) {
  return (
    <Pressable
      className={`flex items-center justify-center px-6 py-3 bg-blue-500 rounded-full ${className || ''}`}
      onPress={action}
    >
      {typeof children === 'string' ? (
        <Text className="text-lg font-bold text-white">{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
