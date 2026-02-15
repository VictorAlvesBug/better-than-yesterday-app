import { PlanTrackerPage } from '@/src/pages/plan-tracker';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function PlanTrackerDetail() {
  const { habitId } = useLocalSearchParams();

  // Você pode usar habitId para buscar dados específicos se precisar
  // const habit = useHabit(habitId);

  return <PlanTrackerPage />;
}
