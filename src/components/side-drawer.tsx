import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

type TextBalanceProps = {
  balance: number;
};

function TextBalanceForFinishedPlan({ balance }: TextBalanceProps) {
  const isPositive = balance >= 0;

  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const signal = isPositive ? '+' : '-';

  const formattedBalance = `${signal}${formatter.format(Math.abs(balance))}`;
  return (
    <Text
      className={`font-semibold ${isPositive ? 'text-green-500' : 'text-red-400'}`}
    >
      {formattedBalance}
    </Text>
  );
}

type SideDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
  const activePlans = ['Treinar 5x na semana', 'Leitura diária'];
  const finishedPlans = [
    {
      name: 'Dieta saudável 21 dias',
      balance: 45.5,
    },
    {
      name: 'Estudar AWS',
      balance: -106.3,
    },
  ];

  return (
    <View
      className={`absolute z-30 flex flex-row w-full h-full ${isOpen ? '' : 'hidden'}`}
    >
      <View
        className={`flex flex-col w-[80%] bg-white transition-all duration-500 ${isOpen ? 'right-0' : 'right-[100%]'}`}
      >
        <LinearGradient
          colors={['#7c3aed', '#4f46e5']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ flex: 1 }}
          className="flex flex-row items-center justify-between gap-3 px-6 pt-6 pb-10"
        >
          <View className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-full">
            <Ionicons name="trophy-outline" size={24} color="#ffffff" />
          </View>
          <View className="flex flex-col items-start justify-center flex-1">
            <Text className="font-semibold text-white">João Silva</Text>
            <Text className="font-thin text-white">Ranking: #42</Text>
          </View>
          <Pressable
            className="flex flex-row items-center justify-center w-10 h-10"
            onPress={onClose}
          >
            <Ionicons name="close-outline" size={26} color="#ffffff" />
          </Pressable>
        </LinearGradient>
        <View className="flex flex-col">
          <View className="flex flex-col">
            <Text className="px-6 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase">
              Planos Ativos
            </Text>
            {activePlans.map((planName) => (
              <View
                key={planName}
                className="flex flex-row items-center justify-start gap-3 px-8 py-4"
              >
                <View className="w-2 h-2 bg-green-500 rounded-full"></View>
                <Text className="font-semibold text-gray-700">{planName}</Text>
              </View>
            ))}
          </View>
          <View className="flex flex-col">
            <Text className="px-6 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase">
              Planos Finalizados
            </Text>
            {finishedPlans.map((plan) => (
              <View
                key={plan.name}
                className="flex flex-row items-center justify-between gap-3 px-8 py-4"
              >
                <Text className="font-semibold text-gray-700">{plan.name}</Text>
                <TextBalanceForFinishedPlan balance={plan.balance} />
              </View>
            ))}
          </View>
          <View className="w-[calc(100%-2rem)] h-[1px] bg-gray-300 mx-auto my-6"></View>
          <View className="flex flex-row items-center justify-start gap-3 px-8 py-3">
            <Ionicons name="home-outline" size={20} color="#374151" />
            <Text className="font-semibold text-gray-700">Início</Text>
          </View>
          <View className="flex flex-row items-center justify-start gap-3 px-8 py-3">
            <Ionicons name="add-circle-outline" size={20} color="#374151" />
            <Text className="font-semibold text-gray-700">
              Gerenciar Planos
            </Text>
          </View>
          <View className="flex flex-row items-center justify-start gap-3 px-8 py-3">
            <Ionicons name="settings-outline" size={20} color="#374151" />
            <Text className="font-semibold text-gray-700">Configurações</Text>
          </View>
          <View className="flex flex-row items-center justify-start gap-3 px-8 py-3">
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#374151"
            />
            <Text className="font-semibold text-gray-700">Sobre nós</Text>
          </View>
          <View className="flex flex-row items-center justify-start gap-3 px-8 py-3 mt-4">
            <Ionicons name="log-out-outline" size={20} color="#b91c1c" />
            <Text className="font-semibold text-red-700">Sair</Text>
          </View>
        </View>
      </View>
      <Pressable
        className={`flex-1 bg-black transition-all duration-500 opacity-40`}
        onPress={onClose}
      ></Pressable>
    </View>
  );
}
