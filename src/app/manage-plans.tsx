import { getColor } from '@/types/color.type';
import Constants from 'expo-constants';
import { ScrollView, Text, View } from 'react-native';
import { Button } from '../components/button';
import SideDrawer, { SideDrawerOpenButton } from '../components/side-drawer';

import { useState } from 'react';
import GradientView from '../components/gradient-view';
import useNavigation from '../hooks/useNavigation';
import { toastInfoMessage } from '../utils/toastUtils';

export default function ManagePlansScreen() {
  const navigation = useNavigation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <View
      className="relative flex-1"
      style={{ marginTop: 0, backgroundColor: getColor("gray-e") }}
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
        <GradientView
        style={{
          paddingTop: Constants.statusBarHeight,
        }}
        className="flex flex-col items-center justify-center w-full"
      >
        <View className="flex flex-row items-center justify-start w-full">
          <SideDrawerOpenButton setIsDrawerOpen={setIsDrawerOpen} />
          <View className="flex flex-col items-center justify-center">
            <Text className="text-xl font-bold text-center text-white">
              Gerenciar Planos
            </Text>
          </View>
        </View>
        </GradientView>

        <View
          className={`w-full px-4 gap-3 py-3`}
        >

          <Button action={() => navigation.push('/create-plan')}>Criar Novo Plano</Button>
          <Button action={() => toastInfoMessage('TODO: Abrir modal para colar link de convidado')}>
            Tenho um Link de Convidado</Button>
          <Button action={() => navigation.push('/public-plans')}>Planos Populares</Button>
        </View>
      </ScrollView>
    </View>
  );
}
