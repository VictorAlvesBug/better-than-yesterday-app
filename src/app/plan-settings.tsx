import Memory from '@/src/api/memory';
import { getColor } from '@/types/color.type';
import { PlanEnriched } from '@/types/plan.type';
import Constants from 'expo-constants';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  LayoutChangeEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import BackButton from '../components/back-button';
import CheckinsWithReviewsList from '../components/checkins-with-reviews-list';
import GradientView from '../components/gradient-view';
import Icon from '../components/icon';
import Ranking from '../components/ranking';
import { useRepositories } from '../hooks/useRepositories';
import {
  formatInteger,
  formatMoney,
  formatMoneyCompact,
  formatPercent,
} from '../utils/numberUtils';
import { toastSuccessMessage } from '../utils/toastUtils';
import { DateOnly, getDate, getDateOnly, getDateToFront } from '../utils/dateUtils';

export default function PlanSettingsScreen() {
  const { plan: planRepository } = useRepositories();
  const [currentTab, setCurrentTab] = useState<'ranking' | 'checkins'>('ranking');
  const [planId, setPlanId] = useState('');
  const [plan, setPlan] = useState<PlanEnriched | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const translateX = useRef(new Animated.Value(0)).current;
  const [tabsWidth, setTabsWidth] = useState(0);
  const tabWidth = tabsWidth / 2 || 0;

  const fakeAdminFee = 0.1;//plan?.adminFee ?? 0;
  const fakeTotalPenalties = 280;
  const fakeTotalAdminFee = fakeTotalPenalties * fakeAdminFee;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: currentTab === 'ranking' ? 0 : tabWidth,
      useNativeDriver: true,
    }).start();
  }, [currentTab, tabWidth, translateX]);

  const handleTabsLayout = (e: LayoutChangeEvent) => {
    setTabsWidth(e.nativeEvent.layout.width);
  };

  const fetchPlan = useCallback(async (showLoading = true) => {
    if (showLoading)
      setLoading(true);

    try {
      const storedPlanId = await Memory.get('planId') || '';
      setPlanId(storedPlanId);

      if (!storedPlanId)
        return;

      const dbPlan = await planRepository.getById(storedPlanId);
      setPlan(dbPlan);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [planRepository]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    fetchPlan(false);
  }, [fetchPlan]);

  const copyInviteLink = () => {
    if (!planId)
      return;

    Clipboard.setString(`betterthanyesterdayapp://join/${planId}`);
    toastSuccessMessage('Link de convite copiado!');
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: getColor('gray-e') }}>
        <ActivityIndicator size="large" color={getColor('gray-6')} />
      </View>
    );
  }

  if (!plan) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: getColor('gray-e') }}>
        <Text style={{ color: getColor('white') }} className="text-lg font-bold">Plano não encontrado</Text>
      </View>
    );
  }

  return (
    <View className="relative flex-1" style={{ backgroundColor: getColor('gray-e') }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={getColor('violet')}
            colors={[getColor('violet')]}
          />
        }
      >
        <GradientView
          style={{ paddingTop: Constants.statusBarHeight }}
          className="flex flex-col justify-center items-center w-full"
        >
          <View className="flex flex-row justify-center items-center w-full">
            <BackButton />
            <Text style={{ color: getColor('white') }} className="flex-1 text-lg font-bold text-left">
              {plan.description ?? plan.habitName}
            </Text>
            <Pressable className="flex justify-center items-center w-20 h-20" onPress={copyInviteLink}>
              <Icon name="share-social" size={24} color="white" />
            </Pressable>
          </View>

          <View
            style={{ backgroundColor: getColor('opaque') }}
            className="flex flex-col items-start w-[90%] gap-2 p-4 mb-6 justify-evenly rounded-lg"
          >
            <Text style={{ color: getColor('white') }} className="font-thin">Pool de Recompensas</Text>
            <Text style={{ color: getColor('white') }} className="mb-1 text-3xl font-bold">
              {formatMoney(fakeTotalPenalties - fakeTotalAdminFee)}
            </Text>

            <View className="flex flex-row justify-evenly items-center w-full">
              <View className="flex flex-col gap-1 justify-center items-center">
                <Text style={{ color: getColor('white') }} className="text-xs font-thin">
                  Total Multas
                </Text>
                <Text style={{ color: getColor('white') }} className="font-semibold">
                  {formatMoneyCompact(fakeTotalPenalties)}
                </Text>
              </View>
              <View className="flex flex-col gap-1 justify-center items-center">
                <Text style={{ color: getColor('white') }} className="text-xs font-thin">
                  Taxa Admin ({formatPercent(fakeAdminFee)})
                </Text>
                <Text style={{ color: getColor('white') }} className="font-semibold">
                  {formatMoneyCompact(fakeTotalAdminFee)}
                </Text>
              </View>
              <View className="flex flex-col gap-1 justify-center items-center">
                <Text style={{ color: getColor('white') }} className="text-xs font-thin">
                  Membros
                </Text>
                <Text style={{ color: getColor('white') }} className="font-semibold">
                  {formatInteger(plan.memberCount)}
                </Text>
              </View>
            </View>
          </View>
        </GradientView>

        <View className="flex flex-col gap-4 justify-center items-center px-4 my-4">
          <View
            className="flex overflow-hidden flex-row justify-center items-center w-full h-14 bg-white rounded-2xl shadow-md"
            onLayout={handleTabsLayout}
          >
            {tabWidth > 0 && (
              <Animated.View
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: tabWidth,
                  transform: [{ translateX }],
                }}
              >
                <GradientView
                  style={{
                    flex: 1,
                    margin: 4,
                    borderRadius: 12,
                  }}
                />
              </Animated.View>
            )}

            <Pressable className="flex-1 h-full" onPress={() => setCurrentTab('ranking')}>
              <View className="flex-1 justify-center items-center mx-1 rounded-xl">
                <Text
                  style={{ color: getColor(currentTab === 'ranking' ? 'white' : 'gray-7') }}
                  className="text-lg font-semibold"
                >
                  Ranking
                </Text>
              </View>
            </Pressable>
            <Pressable className="flex-1 h-full" onPress={() => setCurrentTab('checkins')}>
              <View className="flex-1 justify-center items-center mx-1 rounded-xl">
                <Text
                  style={{ color: getColor(currentTab === 'checkins' ? 'white' : 'gray-7') }}
                  className="text-lg font-semibold"
                >
                  Check-ins
                </Text>
              </View>
            </Pressable>
          </View>

          {currentTab === 'ranking' && planId && (
            <Ranking planId={planId} refreshKey={refreshKey} />
          )}
          {currentTab === 'checkins' && planId && (
            <CheckinsWithReviewsList planId={planId} refreshKey={refreshKey} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
