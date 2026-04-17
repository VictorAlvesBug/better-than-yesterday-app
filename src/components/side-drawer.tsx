import Memory from '@/src/api/memory';
import createPlanRepository from '@/src/api/planRepository';
import createUserRepository from '@/src/api/userRepository';
import { getColor } from '@/types/color.type';
import { PlanEnriched } from '@/types/plan.type';
import { User } from '@/types/user.type';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { useAuth } from '../context/auth';
import useNavigation from '../hooks/useNavigation';
import { getDateOnly } from '../utils/dateUtils';
import { formatInteger, formatMoney } from '../utils/numberUtils';
import GradientView from './gradient-view';
import Icon from './icon';

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
  const { signOut } = useAuth();
  const navigation = useNavigation();
  const userRepository = createUserRepository();
  const planRepository = createPlanRepository();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<PlanEnriched[]>([]);

  const activePlans = plans.filter(plan => /*plan.startsAt <= getDateOnly() &&*/ plan.endsAt >= getDateOnly()); // TODO: Remove 'not-started' status from filter
  const finishedPlans = plans.filter(plan => plan.endsAt < getDateOnly());

  useEffect(() => {
    const fetchUser = async () => {
      const userId = await Memory.get('userId') || '';

      const user = await userRepository.getById(userId);

      if (!userId || !user) {
        navigation.replace('/login');
        return;
      }

      setUser(user)
    };

    isOpen && fetchUser();
  }, [navigation, userRepository, isOpen]);

  useEffect(() => {
    if (!user)
      return;

    const fetchPlans = async () => {
      const plans = await planRepository.listByUserId(user.id);
      setPlans(plans);
      setLoading(false);
    };

    fetchPlans();
  }, [planRepository, user]);

  if (!user)
    return;

  return (
    <View
      style={{
        paddingTop: Constants.statusBarHeight,
      }}
      className={`absolute z-30 flex flex-row w-full h-full ${isOpen ? '' : 'hidden'}`}
    >
      <View
        className={`flex flex-col w-[80%] bg-white transition-all duration-500 ${isOpen ? 'right-0' : 'right-[100%]'}`}
      >
        <GradientView
          className="flex flex-row items-center justify-between gap-3 px-6 pt-6 pb-10"
        >
          <Image
            source={{ uri: user.photo }}
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
            <Icon name="close" size={26} color="white" />
          </Pressable>
        </GradientView>
        <View className="flex flex-col">
          {loading && (
            <ActivityIndicator size="large" color={getColor("gray-6")} />
          )}
          {
            !loading && activePlans.length > 0
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
                      const forceReload = await Memory.get('planId') !== plan.id;
                      await Memory.set('planId', plan.id);
                      navigation.push('/plan-tracker', forceReload);
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
            !loading && finishedPlans.length > 0
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
            !loading && plans.length > 0
            && <View style={{ backgroundColor: getColor("gray-9"), width: "90%", height: 0.5 }} className="mx-auto my-6"></View>
          }
          <Pressable
            onPress={() => { navigation.replace('/manage-plans'); onClose(); }}
            className="flex flex-row items-center justify-start gap-3 px-8 py-3">
            <View className="flex flex-row items-center justify-center w-5">
              <Icon name="add-circle-outline" size={16} color={"gray-3"} />
            </View>
            <Text style={{ color: getColor("gray-3") }} className="font-semibold">
              Gerenciar Planos
            </Text>
          </Pressable>
          <View className="flex flex-row items-center justify-start gap-3 px-8 py-3">
            <View className="flex flex-row items-center justify-center w-5">
              <Icon name="settings-outline" size={16} color={"gray-3"} />
            </View>
            <Text style={{ color: getColor("gray-3") }} className="my-auto font-semibold">
              Configurações
            </Text>
          </View>
          <View className="flex flex-row items-center justify-start gap-3 px-8 py-3">
            <View className="flex flex-row items-center justify-center w-5">
              <Icon
                name="information-circle-outline"
                size={16}
                color={"gray-3"}
              />
            </View>
            <Text style={{ color: getColor("gray-3") }} className="font-semibold">Sobre nós</Text>
          </View>
          <Pressable
            onPress={signOut}
            className="flex flex-row items-center justify-start gap-3 px-8 py-3 mt-4"
          >
            <View className="flex flex-row items-center justify-center w-5">
              <Icon name="log-out-outline" size={16} color={"danger"} />
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

type SideDrawerOpenButtonProps = {
  setIsDrawerOpen: (open: boolean) => void
};

export function SideDrawerOpenButton({ setIsDrawerOpen }: SideDrawerOpenButtonProps) {
  return (

    <Pressable
      className="flex items-center justify-center w-20 h-20"
      onPress={() => setIsDrawerOpen(true)}
      hitSlop={10}
    >
      <Icon name="menu" size={24} color={"white"} />
    </Pressable>
  )
}

