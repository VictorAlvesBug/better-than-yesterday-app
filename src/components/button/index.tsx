import { Pressable, Text } from 'react-native';

type ButtonProps = {
  text: string;
  action: () => void;
};

export function Button({ text, action }: ButtonProps) {
  return (
    <Pressable
      className="bg-blue-500 px-6 py-3 rounded-full flex justify-center items-center"
      onPress={action}
    >
      <Text className="text-lg font-bold text-white">{text}</Text>
    </Pressable>
  );
}
