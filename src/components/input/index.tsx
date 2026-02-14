import { Feather } from '@expo/vector-icons';
import { TextInput, View } from 'react-native';

export function Input() {
  return (
    <View className="w-full flex flex-row border border-slate-500 h-14 rounded-full items-center gap-2 px-4 bg-transparent">
      <Feather name="search" size={20} color="#64748b" />
      <TextInput
        placeholder="Search"
        className="w-full h-full flex-1 bg-transparent"
      />
    </View>
  );
}
