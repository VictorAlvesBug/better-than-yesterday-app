import { getColor } from '@/types/color.type';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { formatIntegerCompact, formatMoneyCompact } from '../utils/numberUtils';

export default function LoginScreen() {
  const router = useRouter();
  //const { signIn } = useAuth();

  return (
    <LinearGradient
      colors={[getColor("violet"), getColor("purple")]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      className="flex items-center justify-center flex-1"
    >
      <View className="flex items-center justify-center flex-1 w-[90%] max-w-[450px]">
        <View style={{backgroundColor: getColor("light-violet")}} className="flex items-center justify-center mb-8 rounded-full w-28 h-28">
          <FontAwesome6 name="trophy" size={46} color={getColor("gold")} />
        </View>
        <Text className="px-8 mb-2 text-4xl font-bold text-white">BTY</Text>
        <Text className="px-8 mb-2 text-lg font-semibold text-white">
          Better Than Yesterday
        </Text>
        <View className="flex flex-row items-center justify-center gap-2 px-8 mb-12">
          <Ionicons name="trending-up-outline" size={18} color={getColor("gold")} />
          <Text className="font-thin text-white">
            Construa hábitos. Ganhe recompensas.
          </Text>
        </View>
        <Pressable
          className="w-full mb-6"
          onPress={() => router.push('/plan-tracker')}
        >
          <View className="flex flex-row items-center justify-center gap-3 py-4 bg-white rounded-xl">
            <Image
              source={{
                uri: 'https://developers.google.com/identity/images/g-logo.png',
              }}
              style={{ width: 24, height: 24 }}
            />
            <Text className="text-lg font-semibold text-black">
              Continuar com Google
            </Text>
          </View>
        </Pressable>
        <Text className="px-8 mb-12 text-xs font-thin text-center text-white">
          Ao continuar, você concorda com nossos Termos de Uso e Política de
          Privacidade.
        </Text>
        <View className="flex flex-row items-center justify-between w-full px-4">
          <View className="flex flex-col items-center justify-center flex-1 gap-1 rounded-full">
            <Text className="text-2xl font-bold text-white">
              {formatIntegerCompact(5_000) + '+'}
            </Text>
            <Text className="text-sm font-thin text-white">Usuários</Text>
          </View>
          <View className="flex flex-col items-center justify-center flex-1 gap-1 rounded-full">
            <Text className="text-2xl font-bold text-white">
              {formatIntegerCompact(10_000) + '+'}
            </Text>
            <Text className="text-sm font-thin text-white">Hábitos</Text>
          </View>
          <View className="flex flex-col items-center justify-center flex-1 gap-1 rounded-full">
            <Text className="text-2xl font-bold text-white">
              {formatMoneyCompact(50_000) + '+'}
            </Text>
            <Text className="text-sm font-thin text-white">Distribuídos</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
