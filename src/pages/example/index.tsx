import Constants from 'expo-constants';

import { Header } from '@/src/components/header';
import { Input } from '@/src/components/input';
import { Section } from '@/src/components/section';
import { ScrollView, Text, View } from 'react-native';

const statusBarHeight = Constants.statusBarHeight;

export default function Example() {
  return (
    <ScrollView
      style={{ flex: 1 }}
      className="bg-slate-200"
      showsVerticalScrollIndicator={false}
    >
      <View
        className="fixed w-full px-4 gap-2"
        style={{ marginTop: statusBarHeight + 8 }}
      >
        <Header />
        <Input />
      </View>

      <Section
        name="Comidas em alta"
        label="Veja mais"
        size="text-lg"
        action={() => console.log('Section clicked')}
      >
        <Text className="text-sm text-gray-500">
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
        </Text>
      </Section>

      <Section
        name="Comidas em alta"
        label="Veja mais"
        size="text-lg"
        action={() => console.log('Section clicked')}
      >
        <Text className="text-sm text-gray-500">
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
        </Text>
      </Section>

      <Section
        name="Comidas em alta"
        label="Veja mais"
        size="text-lg"
        action={() => console.log('Section clicked')}
      >
        <Text className="text-sm text-gray-500">
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
          Confira as comidas mais populares do momento. Confira as comidas mais
          populares do momento. Confira as comidas mais populares do momento.
        </Text>
      </Section>
    </ScrollView>
  );
}
