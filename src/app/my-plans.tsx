import { getColor } from '@/types/color.type';
import { PlanEnriched } from '@/types/plan.type';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Memory from '../api/memory';
import { Button } from '../components/button';
import DateRangeSelect from '../components/date-range-select';
import ScreenHeader from '../components/screen-header';
import ScreenLayout from '../components/screen-layout';
import { useRepositories } from '../hooks/useRepositories';
import useNavigation from '../hooks/useNavigation';
import { DateOnly, getDateOnlyWithOffset, getDateToFront } from '../utils/dateUtils';
import { toastErrorMessage, toastSuccessMessage } from '../utils/toastUtils';

export default function MyPlansScreen() {
  const navigation = useNavigation();
  const { plan: planRepository } = useRepositories();
  const [userId, setUserId] = useState('');
  const [plans, setPlans] = useState<PlanEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PlanEnriched | null>(null);
  const [startsAt, setStartsAt] = useState<DateOnly>('' as DateOnly);
  const [endsAt, setEndsAt] = useState<DateOnly>('' as DateOnly);

  const load = useCallback(async () => {
    const storedUserId = await Memory.get('userId') || '';
    setUserId(storedUserId);
    if (!storedUserId) {
      setPlans([]);
      setLoading(false);
      return;
    }

    const owned = await planRepository.list({ ownerId: storedUserId });
    setPlans(owned);
    setLoading(false);
  }, [planRepository]);

  useEffect(() => {
    load();
  }, [load]);

  const postpone = async (plan: PlanEnriched) => {
    try {
      await planRepository.updatePeriod(
        plan.id,
        userId,
        getDateOnlyWithOffset(7, plan.startsAt),
        getDateOnlyWithOffset(7, plan.endsAt),
      );
      toastSuccessMessage('Plano adiado em 7 dias');
      await load();
    } catch {
      toastErrorMessage('Não foi possível adiar o plano');
    }
  };

  const saveDates = async () => {
    if (!editing)
      return;

    try {
      await planRepository.updatePeriod(editing.id, userId, startsAt, endsAt);
      toastSuccessMessage('Datas atualizadas');
      setEditing(null);
      await load();
    } catch {
      toastErrorMessage('Não foi possível salvar as datas');
    }
  };

  const cancelPlan = (plan: PlanEnriched) => {
    Alert.alert('Cancelar plano', 'As multas pagas serão devolvidas.', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar plano',
        style: 'destructive',
        onPress: async () => {
          try {
            await planRepository.cancel(plan.id);
            toastSuccessMessage('Plano cancelado');
            await load();
          } catch {
            toastErrorMessage('Não foi possível cancelar o plano');
          }
        },
      },
    ]);
  };

  return (
    <ScreenLayout header={<ScreenHeader title="Meus planos" />}>
      {loading ? (
        <ActivityIndicator className="mt-8" color={getColor('violet')} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {plans.length === 0 && (
            <Text style={{ color: getColor('gray-3') }} className="text-base">
              Você ainda não criou um plano.
            </Text>
          )}
          {plans.map((plan) => {
            const canEdit = plan.status === 'NotStarted';
            const waitingForMembers = canEdit && plan.startsAt <= getDateOnlyWithOffset(0);
            return (
              <View key={plan.id} className="w-full gap-3 p-4 bg-white shadow-md rounded-2xl">
                <Text style={{ color: getColor('black') }} className="text-base font-semibold">
                  {plan.habitName}
                </Text>
                <Text style={{ color: getColor('gray-3') }} className="text-sm">
                  {`${getDateToFront(plan.startsAt)} até ${getDateToFront(plan.endsAt)} · ${plan.memberCount} membros`}
                </Text>
                {waitingForMembers && (
                  <Text style={{ color: getColor('dark-orange') }} className="text-sm">
                    O plano precisa de pelo menos dois membros para iniciar. Convide amigos ou adie o plano.
                  </Text>
                )}
                {canEdit && (
                  <View className="gap-2">
                    <Button action={() => postpone(plan)} type="outline">Adiar 7 dias</Button>
                    <Button
                      action={() => {
                        setEditing(plan);
                        setStartsAt(plan.startsAt);
                        setEndsAt(plan.endsAt);
                      }}
                      type="outline"
                    >
                      Editar datas
                    </Button>
                    <Button action={() => cancelPlan(plan)} color="danger" type="outline">Cancelar</Button>
                    <Button
                      action={() => navigation.push(
                        `/create-plan?habitId=${plan.habitId}&description=${encodeURIComponent(plan.description ?? '')}&type=${plan.type}&daysOffPerWeek=${plan.daysOffPerWeek}&penaltyValue=${plan.penaltyValue}`
                      )}
                    >
                      Duplicar
                    </Button>
                  </View>
                )}
              </View>
            );
          })}
          {editing && (
            <View className="w-full gap-3 p-4 bg-white shadow-md rounded-2xl">
              <Text style={{ color: getColor('black') }} className="text-base font-semibold">Editar período</Text>
              <DateRangeSelect
                startValueLabel="Início"
                startValue={getDateToFront(startsAt)}
                setStartValue={(value) => setStartsAt(value.split('/').reverse().join('-') as DateOnly)}
                endValueLabel="Término"
                endValue={getDateToFront(endsAt)}
                setEndValue={(value) => setEndsAt(value.split('/').reverse().join('-') as DateOnly)}
              />
              <Button action={saveDates}>Salvar</Button>
              <Pressable onPress={() => setEditing(null)}>
                <Text style={{ color: getColor('gray-3') }} className="text-center">Fechar</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}
    </ScreenLayout>
  );
}
