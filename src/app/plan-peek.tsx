import { getColor } from '@/types/color.type';
import { PlanEnriched } from '@/types/plan.type';
import Constants from 'expo-constants';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import createPlanRepository from '../api/planRepository';
import BackButton from '../components/back-button';
import GradientView from '../components/gradient-view';
import Ranking from '../components/ranking';

export default function PlanPeekScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const planRepository = createPlanRepository();
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
    <View className="relative flex-1" style={{ backgroundColor: getColor('gray-e') }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <GradientView
          style={{ paddingTop: Constants.statusBarHeight }}
          className="flex flex-col items-center justify-center w-full pb-6"
        >
          <View className="flex flex-row items-center justify-center w-full">
            <BackButton />
            <Text style={{ color: getColor('white') }} className="flex-1 text-lg font-bold text-left">
              {plan?.description ?? plan?.habitName ?? 'Plano'}
            </Text>
          </View>
          <Text style={{ color: getColor('white') }} className="px-4 mt-2 text-sm">
            Visualização do ranking (somente leitura)
          </Text>
        </GradientView>

        <View className="px-4 mt-4">
          {planId && <Ranking planId={planId} />}
        </View>
      </ScrollView>
    </View>
  );
}
