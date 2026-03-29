import { getColor } from '@/types/color.type';
import { PlanWithHabit } from '@/types/plan.type';
import { User } from '@/types/user.type';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Memory from '../app/api/repositories/memory';
import createPlanRepository from '../app/api/repositories/planRepository';
import createUserRepository from '../app/api/repositories/userRepository';
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
      style={{ color: getColor(isPositive ? "lime" : "danger") }} className={`font-semibold`}
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
  const userRepository = createUserRepository();
  const planRepository = createPlanRepository();

  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<PlanWithHabit[]>([]);

  const activePlans = plans.filter(plan => plan.status === "Running");
  const finishedPlans = plans.filter(plan => plan.status === "Finished");

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      router.replace('/login');
    }
    catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      const userId = await Memory.get('userId');

      if (!userId){
        router.replace('/login');
        return;
      }
      
      const user = await userRepository.getById(userId);

      if (!user){
        router.replace('/login');
        return;
      }

      setUser(user)
    };

    fetchUser();
  }, [router, userRepository]);

  useEffect(() => {
    if (!user)
      return;

    const fetchPlans = async () => {
      const plans = await planRepository.listByUserId(user.id);
      setPlans(plans);
    };

    fetchPlans();
  }, [planRepository, user]);

  if (!user)
    return;

  return (
    <View
      className={`absolute z-30 flex flex-row w-full h-full ${isOpen ? '' : 'hidden'}`}
    >
      <View
        className={`flex flex-col w-[80%] bg-white transition-all duration-500 ${isOpen ? 'right-0' : 'right-[100%]'}`}
      >
        <LinearGradient
          colors={[getColor("violet"), getColor("purple-violet"), getColor("purple")]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          className="flex flex-row items-center justify-between gap-3 px-6 pt-6 pb-10"
        >
          <Image
                    source={require("../../assets/images/logo.png")}
                    resizeMode="cover"
                    className="w-12 h-12 rounded-full"
                  />
          <View className="flex flex-col items-start justify-center flex-1">
            <Text className="font-semibold text-white">{user.name}</Text>
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
          {
            activePlans.length > 0
            && <View className="flex flex-col">
              <Text style={{ color: getColor("gray-7") }} className="px-6 pt-4 pb-2 text-xs font-semibold uppercase">
                Planos Ativos
              </Text>
              {
                activePlans.map((plan) => (
                  <Pressable
                    key={plan.id}
                    className="flex flex-row items-center justify-start gap-3 px-8 py-4"
                    onPress={async () => {
                      await Memory.set('planId', plan.id);
                      router.push('/plan-tracker');
                      onClose();
                    }}
                  >
                    <View style={{ backgroundColor: getColor("lime") }} className="w-2 h-2 rounded-full"></View>
                    <Text style={{ color: getColor("gray-3") }} className="font-semibold">{plan.description ?? plan.habitName}</Text>
                  </Pressable>
                ))
              }
            </View>
          }
          {
            finishedPlans.length > 0
            && <View className="flex flex-col">
              <Text style={{ color: getColor("gray-7") }} className="px-6 pt-4 pb-2 text-xs font-semibold uppercase">
                Planos Finalizados
              </Text>
              {finishedPlans.map((plan) => (
                <View
                  key={plan.id}
                  className="flex flex-row items-center justify-between gap-3 px-8 py-4"
                >
                  <Text style={{ color: getColor("gray-3") }} className="font-semibold">{plan.description ?? plan.habitName}</Text>
                  <TextBalanceForFinishedPlan balance={/*plan.balance*/ 123} />
                </View>
              ))}
            </View>
          }
          {
            plans.length > 0 
            && <View style={{ backgroundColor: getColor("gray-9"), width: "90%", height: 0.5 }} className="mx-auto my-6"></View>
            }
          <Pressable
            onPress={() => { router.replace('/manage-plans'); onClose(); }}
            className="flex flex-row items-center justify-start gap-3 px-8 py-3">
            <View className="flex flex-row items-center justify-center w-5">
              <Ionicons name="add-circle-outline" size={16} color={getColor("gray-3")} />
            </View>
            <Text style={{ color: getColor("gray-3") }} className="font-semibold">
              Gerenciar Planos
            </Text>
          </Pressable>
          <View className="flex flex-row items-center justify-start gap-3 px-8 py-3">
            <View className="flex flex-row items-center justify-center w-5">
              <Ionicons name="settings-outline" size={16} color={getColor("gray-3")} />
            </View>
            <Text style={{ color: getColor("gray-3") }} className="my-auto font-semibold">
              Configurações
            </Text>
          </View>
          <View className="flex flex-row items-center justify-start gap-3 px-8 py-3">
            <View className="flex flex-row items-center justify-center w-5">
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={getColor("gray-3")}
              />
            </View>
            <Text style={{ color: getColor("gray-3") }} className="font-semibold">Sobre nós</Text>
          </View>
          <Pressable
            // onPress={() => router.replace('/login')}
            onPress={signOut}
            className="flex flex-row items-center justify-start gap-3 px-8 py-3 mt-4"
          >
            <View className="flex flex-row items-center justify-center w-5">
              <Ionicons name="log-out-outline" size={16} color={getColor("danger")} />
            </View>
            <Text style={{ color: getColor("danger") }} className="font-semibold">Sair</Text>
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
