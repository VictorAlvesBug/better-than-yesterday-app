import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleProp, Text, View, ViewStyle } from 'react-native';
import BackButton from '../components/back-button';

const statusBarHeight = Constants.statusBarHeight;

type ManagePlansProps = {
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export default function ManagePlansScreen({ className, style }: ManagePlansProps) {
  const router = useRouter();

  return (
    <View
      className="flex-1 bg-slate-200"
      style={{ marginTop: statusBarHeight }}
    >
      <ScrollView
        style={{ flex: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }} // Espaço pro botão
      >
        <LinearGradient
          colors={['#8f10ed', '#5038f6']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          className="flex flex-col items-center justify-center w-full"
        >
          <View className="flex flex-row items-center justify-start w-full">
            <BackButton />
            <View className="flex flex-col items-center justify-center">
              <Text className="text-xl font-bold text-center text-white">
                Gerenciar Planos
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View
          style={style}
          className={`w-full px-4 gap-3 py-3 ${className || ''}`}
        >

          <Pressable
            className="items-center justify-center flex-1 p-4 bg-purple-200 border border-purple-700 rounded-2xl h-14"
            onPress={() => router.push('/create-plan')}
          >
            <Text
              className={`font-semibold text-lg text-purple-700`}
            >
              Criar Novo Plano
            </Text>
          </Pressable>

          <Pressable
            className="items-center justify-center flex-1 p-4 bg-purple-200 border border-purple-700 rounded-2xl h-14"
            onPress={() => console.log('TODO: Abrir modal para colar link de convidado')}
          >
            <Text
              className={`font-semibold text-lg text-purple-700`}
            >
              Tenho um Link de Convidado
            </Text>
          </Pressable>

          <Pressable
            className="items-center justify-center flex-1 p-4 bg-purple-200 border border-purple-700 rounded-2xl h-14"
            onPress={() => console.log('TODO: /trending-plans')}
          >
            <Text
              className={`font-semibold text-lg text-purple-700`}
            >
              Planos Populares
            </Text>
          </Pressable>
          
        </View>
      </ScrollView>
    </View>
  );
}
