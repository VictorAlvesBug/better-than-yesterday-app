import { getColor } from '@/types/color.type';
import { PlanEnriched } from '@/types/plan.type';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import createPlanRepository from '../api/planRepository';
import Ranking from '../components/ranking';
import ScreenHeader from '../components/screen-header';
import ScreenLayout from '../components/screen-layout';

export default function PlanPeekScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const planRepository = useMemo(() => createPlanRepository(), []);
  const [plan, setPlan] = useState<PlanEnriched | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) {
        setLoading(false);
        return;
      }

      const dbPlan = await planRepository.getById(planId);
      setPlan(dbPlan);
      setLoading(false);
    };

    fetchPlan();
  }, [planId, planRepository]);

  if (loading) {
    return (
      <View className="items-center justify-center flex-1" style={{ backgroundColor: getColor('gray-e') }}>
        <ActivityIndicator size="large" color={getColor('gray-6')} />
      </View>
    );
  }

  return (
    <ScreenLayout
      header={
        <ScreenHeader
          title={plan?.description ?? plan?.habitName ?? 'Plano'}
          titleSize="text-lg"
          className="pb-6"
        >
          <Text style={{ color: getColor('white') }} className="px-4 mt-2 text-sm">
            Visualização do ranking (somente leitura)
          </Text>
        </ScreenHeader>
      }
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-4 mt-4">
          {planId && <Ranking planId={planId} />}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
