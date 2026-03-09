import { Pressable, Text, View } from 'react-native';

type SectionProps = {
  name: string;
  size: 'text-lg' | 'text-xl' | 'text-2xl';
  label: string;
  action: () => void;
  children: React.ReactNode;
};

export function Section({ name, size, label, action, children }: SectionProps) {
  return (
    <View className="w-full flex flex-col items-center justify-between px-4">
      <View className="w-full flex flex-row items-center justify-between px-4">
        <Text className={`${size} font-semibold my-4`}>{name}</Text>

        <Pressable onPress={action}>
          <Text>{label}</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}
