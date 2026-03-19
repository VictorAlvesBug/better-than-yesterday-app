import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import BackButton from '../components/back-button';
import { Button } from '../components/button';

const statusBarHeight = Constants.statusBarHeight;

export default function ManagePlansScreen() {
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
          className={`w-full px-4 gap-3 py-3`}
        >

          <Button action={() => router.push('/create-plan')}>Criar Novo Plano</Button>
          <Button action={() => console.log('TODO: Abrir modal para colar link de convidado')}>
            Tenho um Link de Convidado</Button>
          <Button action={() => console.log('TODO: /trending-plans')}>Planos Populares</Button>
        </View>
      </ScrollView>
    </View>
  );
}
