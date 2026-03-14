import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Pressable, Text, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  //const { signIn } = useAuth();
  const buttonRef = useRef(null);

  return (
    <LinearGradient
      colors={['#7c3aed', '#4f46e5']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
      className="flex items-center justify-center flex-1"
    >
      <View className="flex items-center justify-center flex-1 w-[90%] max-w-[450px]">
        <View className="flex items-center justify-center mb-8 bg-purple-700 rounded-full w-28 h-28">
          <Ionicons name="trophy-outline" size={60} color="#ffdf20" />
        </View>
        <Text className="px-8 mb-2 text-4xl font-bold text-white">BTY</Text>
        <Text className="px-8 mb-2 text-lg font-semibold text-white">
          Better Than Yesterday
        </Text>
        <View className="flex flex-row items-center justify-center gap-2 px-8 mb-12">
          <Ionicons name="trending-up-outline" size={18} color="#7bf1a8" />
          <Text className="font-thin text-white">
            Construa hábitos. Ganhe recompensas.
          </Text>
        </View>
        <Pressable
          className="w-full mb-6"
          onPress={() => router.push('/plan-tracker')}
        >
          <View className="flex flex-row items-center justify-center gap-3 py-4 bg-white rounded-xl">
            <Ionicons name="logo-google" size={24} color="#4285F4" />
            <Text className="text-lg font-semibold text-black">
              Continuar com Google
            </Text>
          </View>
        </Pressable>
        <Text className="px-8 mb-12 text-xs font-thin text-center text-white">
          Ao continuar, você concorda com nossos Termos de Uso e Política de
          Privacidade.
        </Text>
        <View className="flex flex-row items-center justify-between w-full px-8">
          <View className="flex flex-col items-center justify-center gap-1 rounded-full">
            <Text className="text-3xl font-bold text-white">5k+</Text>
            <Text className="text-sm font-thin text-white">Usuários</Text>
          </View>
          <View className="flex flex-col items-center justify-center gap-1 rounded-full">
            <Text className="text-3xl font-bold text-white">10k+</Text>
            <Text className="text-sm font-thin text-white">Hábitos</Text>
          </View>
          <View className="flex flex-col items-center justify-center gap-1 rounded-full">
            <Text className="text-3xl font-bold text-white">R$50k</Text>
            <Text className="text-sm font-thin text-white">Distribuídos</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
