import Memory from '@/src/api/memory';
import { getColor } from '@/types/color.type';
import { PlanEnriched } from '@/types/plan.type';
import { User } from '@/types/user.type';
import Constants from 'expo-constants';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../context/auth';
import useNavigation from '../hooks/useNavigation';
import { useRepositories } from '../hooks/useRepositories';
import { getDateOnly } from '../utils/dateUtils';
import { formatInteger, formatMoney } from '../utils/numberUtils';
import GradientView from './gradient-view';
import Icon from './icon';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.8;
const ANIMATION_DURATION = 280;

type TextBalanceProps = {
  balance: number;
};

function TextBalanceForFinishedPlan({ balance }: TextBalanceProps) {
  const isPositive = balance >= 0;

  const signal = isPositive ? '+' : '-';

  const formattedBalance = `${signal}${formatMoney(Math.abs(balance))}`;
  return (
    <Text
      style={{ color: getColor(isPositive ? 'lime' : 'danger') }}
      className="font-semibold"
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
  const { plan: planRepository, ranking: rankingRepository, user: userRepository } = useRepositories();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<PlanEnriched[]>([]);
  const [rankingPosition, setRankingPosition] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const activePlans = plans.filter(plan => plan.endsAt >= getDateOnly());
  const finishedPlans = plans.filter(plan => plan.endsAt < getDateOnly());

  useEffect(() => {
    if (isOpen) {
      mountedRef.current = true;
      setMounted(true);
      translateX.setValue(-DRAWER_WIDTH);
      overlayOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.4,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (!mountedRef.current)
      return;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished)
        return;
      mountedRef.current = false;
      setMounted(false);
    });
  }, [isOpen, overlayOpacity, translateX]);

  useEffect(() => {
    if (!isOpen)
      return;

    const fetchUser = async () => {
      const userId = await Memory.get('userId') || '';
      const dbUser = await userRepository.getById(userId);

      if (!userId || !dbUser) {
        navigation.replace('/login');
        return;
      }

      setUser(dbUser);
    };

    fetchUser();
  }, [navigation, userRepository, isOpen]);

  useEffect(() => {
    if (!isOpen || !user)
      return;

    setLoading(true);

    const fetchPlans = async () => {
      const userPlans = await planRepository.listByUserId(user.id);
      setPlans(userPlans);

      const planId = await Memory.get('planId');
      if (planId) {
        try {
          const ranking = await rankingRepository.getByPlanId(planId, user.id);
          setRankingPosition(ranking.currentUser?.position ?? null);
        } catch {
          setRankingPosition(null);
        }
      } else {
        setRankingPosition(null);
      }

      setLoading(false);
    };

    fetchPlans();
  }, [planRepository, rankingRepository, user, isOpen]);

  if (!mounted)
    return null;

  return (
    <View
      style={{ paddingTop: Constants.statusBarHeight }}
      className="absolute z-30 flex flex-row w-full h-full"
      pointerEvents={isOpen ? 'auto' : 'none'}
    >
      <Animated.View
        style={{
          width: DRAWER_WIDTH,
          transform: [{ translateX }],
        }}
        className="flex flex-col bg-white"
      >
        <GradientView className="flex flex-row items-center justify-between gap-3 px-6 pt-6 pb-10">
          {user ? (
            <Pressable
              className="flex flex-row items-center justify-between flex-1 gap-3"
              onPress={() => {
                navigation.push('/settings');
                onClose();
              }}
            >
              <Image
                source={{ uri: user.photoUrl || undefined }}
                resizeMode="cover"
                className="w-12 h-12 rounded-full"
                style={{ backgroundColor: getColor('gray-d') }}
              />
              <View className="flex flex-col items-start justify-center flex-1">
                <Text className="font-semibold text-white">{user.nickname}</Text>
                <Text className="font-thin text-white">
                  {rankingPosition
                    ? `Ranking: #${formatInteger(rankingPosition)}`
                    : 'Ranking: —'}
                </Text>
              </View>
            </Pressable>
          ) : (
            <View className="flex-1">
              <ActivityIndicator color={getColor('white')} />
            </View>
          )}
          <Pressable
            className="flex flex-row items-center justify-center w-10 h-10"
            onPress={onClose}
          >
            <Icon name="close" size={26} color="white" />
          </Pressable>
        </GradientView>
        <View className="flex flex-col">
          {loading && (
            <ActivityIndicator size="large" color={getColor('gray-6')} />
          )}
          {!loading && activePlans.length > 0 && (
            <View className="flex flex-col">
              <Text
                style={{ color: getColor('gray-7') }}
                className="px-6 pt-4 pb-2 text-xs font-semibold uppercase"
              >
                Planos Ativos
              </Text>
              {activePlans.map(plan => (
                <Pressable
                  key={plan.id}
                  className="flex flex-row items-center justify-start gap-3 px-8 py-4"
                  onPress={async () => {
                    const forceReload = (await Memory.get('planId')) !== plan.id;
                    await Memory.set('planId', plan.id);
                    navigation.push('/plan-tracker', forceReload);
                    onClose();
                  }}
                >
                  <View
                    style={{ backgroundColor: getColor('lime') }}
                    className="w-2 h-2 rounded-full"
                  />
                  <Text style={{ color: getColor('gray-3') }} className="font-semibold">
                    {plan.description ?? plan.habitName}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          {!loading && finishedPlans.length > 0 && (
            <View className="flex flex-col">
              <Text
                style={{ color: getColor('gray-7') }}
                className="px-6 pt-4 pb-2 text-xs font-semibold uppercase"
              >
                Planos Finalizados
              </Text>
              {finishedPlans.map(plan => (
                <View
                  key={plan.id}
                  className="flex flex-row items-center justify-between gap-3 px-8 py-4"
                >
                  <Text style={{ color: getColor('gray-3') }} className="font-semibold">
                    {plan.description ?? plan.habitName}
                  </Text>
                  <TextBalanceForFinishedPlan balance={123} />
                </View>
              ))}
            </View>
          )}
          {!loading && plans.length > 0 && (
            <View
              style={{ backgroundColor: getColor('gray-9'), width: '90%', height: 0.5 }}
              className="mx-auto my-6"
            />
          )}
          <Pressable
            onPress={() => {
              navigation.replace('/manage-plans');
              onClose();
            }}
            className="flex flex-row items-center justify-start gap-3 px-8 py-3"
          >
            <View className="flex flex-row items-center justify-center w-5">
              <Icon name="add-circle-outline" size={16} color="gray-3" />
            </View>
            <Text style={{ color: getColor('gray-3') }} className="font-semibold">
              Gerenciar Planos
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              navigation.push('/settings');
              onClose();
            }}
            className="flex flex-row items-center justify-start gap-3 px-8 py-3"
          >
            <View className="flex flex-row items-center justify-center w-5">
              <Icon name="settings-outline" size={16} color="gray-3" />
            </View>
            <Text style={{ color: getColor('gray-3') }} className="my-auto font-semibold">
              Configurações
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              navigation.push('/about');
              onClose();
            }}
            className="flex flex-row items-center justify-start gap-3 px-8 py-3"
          >
            <View className="flex flex-row items-center justify-center w-5">
              <Icon name="information-circle-outline" size={16} color="gray-3" />
            </View>
            <Text style={{ color: getColor('gray-3') }} className="font-semibold">
              Sobre nós
            </Text>
          </Pressable>
          <Pressable
            onPress={signOut}
            className="flex flex-row items-center justify-start gap-3 px-8 py-3 mt-4"
          >
            <View className="flex flex-row items-center justify-center w-5">
              <Icon name="log-out-outline" size={16} color="danger" />
            </View>
            <Text style={{ color: getColor('danger') }} className="font-semibold">
              Sair
            </Text>
          </Pressable>
        </View>
      </Animated.View>
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'black',
          opacity: overlayOpacity,
          width: '100%',
        }}
      >
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>
    </View>
  );
}

type SideDrawerOpenButtonProps = {
  setIsDrawerOpen: (open: boolean) => void;
};

export function SideDrawerOpenButton({ setIsDrawerOpen }: SideDrawerOpenButtonProps) {
  return (
    <Pressable
      className="flex items-center justify-center w-20 h-20"
      onPress={() => setIsDrawerOpen(true)}
      hitSlop={10}
    >
      <Icon name="menu" size={24} color="white" />
    </Pressable>
  );
}
