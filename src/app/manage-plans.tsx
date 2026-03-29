import { getColor } from '@/types/color.type';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Button } from '../components/button';
import SideDrawer from '../components/side-drawer';

import { useState } from 'react';
const statusBarHeight = Constants.statusBarHeight;

export default function ManagePlansScreen() {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <View
      className="relative flex-1"
      style={{ marginTop: statusBarHeight, backgroundColor: getColor("gray-e") }}
    >
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
      <ScrollView
        style={{ flex: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }} // Espaço pro botão
      >
        <LinearGradient
          colors={[getColor("violet"), getColor("purple-violet"), getColor("purple")]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          className="flex flex-col items-center justify-center w-full"
        >
          <View className="flex flex-row items-center justify-start w-full">
            <Pressable
              className="flex items-center justify-center w-20 h-20"
              onPress={() => setIsDrawerOpen(true)}
              hitSlop={10}
            >
              <Ionicons name="menu" size={24} color={getColor("white")} />
            </Pressable>

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
