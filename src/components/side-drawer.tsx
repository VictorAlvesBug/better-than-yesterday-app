import { getColor } from '@/types/common.type';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { formatInteger, formatMoney } from '../utils/numberUtils';

type TextBalanceProps = {
  balance: number;
};

function TextBalanceForFinishedPlan({ balance }: TextBalanceProps) {
  const isPositive = balance >= 0;

  const signal = isPositive ? '+' : '-';

  const formattedBalance = `${signal}${formatMoney(Math.abs(balance))}`;
  return (
    <Text
      style={{color: getColor(isPositive ? "lime" : "danger")}} className={`font-semibold`}
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
  const router = useRouter();

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
                  colors={[getColor("violet"), getColor("purple")]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          className="flex flex-row items-center justify-between gap-3 px-6 pt-6 pb-10"
        >
          <View style={{backgroundColor: getColor("light-violet")}} className="flex items-center justify-center w-12 h-12 rounded-full">
            <FontAwesome6 name="trophy" size={20} color={getColor("gold")} />
          </View>
          <View className="flex flex-col items-start justify-center flex-1">
            <Text className="font-semibold text-white">João Silva</Text>
            <Text className="font-thin text-white">
              Ranking: #{formatInteger(42)}
            </Text>
          </View>
          <Pressable
            className="flex flex-row items-center justify-center w-10 h-10"
            onPress={onClose}
          >
            <Ionicons name="close" size={26} color="white" />
          </Pressable>
        </LinearGradient>
        <View className="flex flex-col">
          <View className="flex flex-col">
            <Text style={{color: getColor("gray")}} className="px-6 pt-4 pb-2 text-xs font-semibold uppercase">
              Planos Ativos
            </Text>
            {activePlans.map((planName) => (
              <View
                key={planName}
                className="flex flex-row items-center justify-start gap-3 px-8 py-4"
              >
                <View style={{backgroundColor: getColor("lime")}} className="w-2 h-2 rounded-full"></View>
                <Text style={{color: getColor("dark-gray")}} className="font-semibold">{planName}</Text>
              </View>
            ))}
          </View>
          <View className="flex flex-col">
            <Text style={{color: getColor("gray")}} className="px-6 pt-4 pb-2 text-xs font-semibold uppercase">
              Planos Finalizados
            </Text>
            {finishedPlans.map((plan) => (
              <View
                key={plan.name}
                className="flex flex-row items-center justify-between gap-3 px-8 py-4"
              >
                <Text style={{color: getColor("dark-gray")}} className="font-semibold">{plan.name}</Text>
                <TextBalanceForFinishedPlan balance={plan.balance} />
              </View>
            ))}
          </View>
          <View style={{backgroundColor: getColor("light-gray"), width: "90%", height: 0.5}} className="mx-auto my-6"></View>
          <View className="flex flex-row items-center justify-start gap-3 px-8 py-3">
            <View className="flex flex-row items-center justify-center w-5">
              <Ionicons name="home-outline" size={16} color={getColor("dark-gray")} />
            </View>
            <Text style={{color: getColor("dark-gray")}} className="font-semibold">Início</Text>
          </View>
          <Pressable
            onPress={() => {router.push('/manage-plans'); onClose();}}
             className="flex flex-row items-center justify-start gap-3 px-8 py-3">
            <View className="flex flex-row items-center justify-center w-5">
              <Ionicons name="add-circle-outline" size={16} color={getColor("dark-gray")} />
            </View>
            <Text style={{color: getColor("dark-gray")}} className="font-semibold">
              Gerenciar Planos
            </Text>
          </Pressable>
          <View className="flex flex-row items-center justify-start gap-3 px-8 py-3">
            <View className="flex flex-row items-center justify-center w-5">
              <Ionicons name="settings-outline" size={16} color={getColor("dark-gray")} />
            </View>
            <Text style={{color: getColor("dark-gray")}} className="my-auto font-semibold">
              Configurações
            </Text>
          </View>
          <View className="flex flex-row items-center justify-start gap-3 px-8 py-3">
            <View className="flex flex-row items-center justify-center w-5">
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={getColor("dark-gray")}
              />
            </View>
            <Text style={{color: getColor("dark-gray")}} className="font-semibold">Sobre nós</Text>
          </View>
          <Pressable
            onPress={() => router.push('/login')}
            className="flex flex-row items-center justify-start gap-3 px-8 py-3 mt-4"
          >
            <View className="flex flex-row items-center justify-center w-5">
              <Ionicons name="log-out-outline" size={16} color={getColor("danger")} />
            </View>
            <Text style={{color: getColor("danger")}} className="font-semibold">Sair</Text>
          </Pressable>
        </View>
      </View>
      <Pressable
        className={`flex-1 bg-black transition-all duration-500 opacity-40`}
        onPress={onClose}
      ></Pressable>
    </View>
  );
}
