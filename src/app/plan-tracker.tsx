import Memory from '@/src/api/memory';
import { getColor } from '@/types/color.type';
import { PlanEnriched } from '@/types/plan.type';
import Constants from 'expo-constants';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import PlanTrackerContent from '../components/plan-tracker-content';
import useNavigation from '../hooks/useNavigation';
import { useRepositories } from '../hooks/useRepositories';

const statusBarHeight = Constants.statusBarHeight;

export default function PlanTrackerScreen() {
  const { plan: planRepository } = useRepositories();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [plan, setPlan] = useState<PlanEnriched | null>(null);

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading)
      setLoading(true);

    try {
      const planId = await Memory.get('planId');

      if (!planId) {
        navigation.replace('/manage-plans');
        return;
      }

      const dbPlan = await planRepository.getById(planId);

      if (!dbPlan) {
        await Memory.remove('planId');
        navigation.replace('/manage-plans');
        return;
      }

      setPlan(dbPlan);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [planRepository, navigation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    fetchData(false);
  }, [fetchData]);

  if (loading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ marginTop: statusBarHeight, backgroundColor: getColor('gray-e') }}
      >
        <ActivityIndicator size="large" color={getColor('gray-6')} />
        <Text style={{ color: getColor('gray-6') }} className="mt-2 text-sm">Carregando plano...</Text>
      </View>
    );
  }

  if (!plan)
    return null;

  return (
    <PlanTrackerContent
      plan={plan}
      refreshing={refreshing}
      onRefresh={onRefresh}
      refreshKey={refreshKey}
    />
  );
}
