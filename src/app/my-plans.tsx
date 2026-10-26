import { getColor } from '@/types/color.type';
import { PlanEnriched, PlanStatus } from '@/types/plan.type';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import Memory from '../api/memory';
import { Button } from '../components/button';
import DateRangeSelect from '../components/date-range-select';
import ScreenHeader from '../components/screen-header';
import ScreenLayout from '../components/screen-layout';
import { useRepositories } from '../hooks/useRepositories';
import useNavigation from '../hooks/useNavigation';
import { DateOnly, getDateOnly, getDateOnlyWithOffset, getDateToFront } from '../utils/dateUtils';
import { commitmentLabel, duplicatePlanPath, elapsedPercent, penaltyScale } from '../utils/planUtils';
import { toastErrorMessage, toastSuccessMessage } from '../utils/toastUtils';

const statusLabel: Record<PlanStatus, string> = {
  NotStarted: 'Ainda não começou',
  Running: 'Em andamento',
  Finished: 'Encerrado',
  Cancelled: 'Cancelado',
};

export default function MyPlansScreen() {
  const navigation = useNavigation();
  const { plan: planRepository } = useRepositories();
  const [userId, setUserId] = useState('');
  const [plans, setPlans] = useState<PlanEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState<PlanEnriched | null>(null);
  const [startsAt, setStartsAt] = useState<DateOnly>(getDateOnly());
  const [endsAt, setEndsAt] = useState<DateOnly>(getDateOnly());

  const load = useCallback(async () => {
    const storedUserId = await Memory.get('userId') || '';
    setUserId(storedUserId);
    if (!storedUserId) {
      setPlans([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const owned = await planRepository.list({ ownerId: storedUserId });
    setPlans(owned);
    setLoading(false);
    setRefreshing(false);
  }, [planRepository]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openPlan = async (plan: PlanEnriched) => {
    await Memory.set('planId', plan.id);
    navigation.push('/plan-tracker');
  };

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

    const today = getDateOnly();
    if (startsAt <= today) {
      toastErrorMessage('A data de início deve ser a partir de amanhã');
      return;
    }

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
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={getColor('violet')} />
          }
        >
          {plans.length === 0 && (
            <Text style={{ color: getColor('gray-3') }} className="text-base">
              Você ainda não criou um plano.
            </Text>
          )}
          {plans.map((plan) => {
            const canEdit = plan.status === 'NotStarted';
            const today = getDateOnly();
            const tomorrow = getDateOnlyWithOffset(1);
            const missingQuorumAndStartsTomorrow = plan.memberCount < 2 && plan.startsAt === tomorrow;
            const percent = elapsedPercent(plan.startsAt, plan.endsAt, today);
            return (
              <Pressable key={plan.id} onPress={() => openPlan(plan)} className="w-full gap-3 p-4 bg-white shadow-md rounded-2xl">
                <View className="flex flex-row gap-3">
                  {plan.coverPhotoUrl ? (
                    <Image source={{ uri: plan.coverPhotoUrl }} style={{ width: 72, height: 72, borderRadius: 12 }} />
                  ) : (
                    <View style={{ width: 72, height: 72, borderRadius: 12, backgroundColor: getColor('gray-e') }} />
                  )}
                  <View className="flex-1 gap-1">
                    <Text style={{ color: getColor('black') }} className="text-base font-semibold">
                      {plan.description || plan.habitName}
                    </Text>
                    <Text style={{ color: getColor('gray-3') }} className="text-sm">
                      {`${getDateToFront(plan.startsAt)} até ${getDateToFront(plan.endsAt)} · ${percent}%`}
                    </Text>
                    <Text style={{ color: getColor('gray-3') }} className="text-sm">
                      {`${plan.memberCount} membros · ${penaltyScale(plan.penaltyValue)} · ${commitmentLabel(plan.daysOffPerWeek)} · ${statusLabel[plan.status]}`}
                    </Text>
                  </View>
                </View>
                {missingQuorumAndStartsTomorrow && (
                  <Text style={{ color: getColor('dark-orange') }} className="text-sm">
                    Convide mais amigos e poderemos iniciar amanhã.
                  </Text>
                )}
                <View className="gap-2">
                  {canEdit && (
                    <>
                      <Button action={() => postpone(plan)} type="outline">Adiar 7 dias</Button>
                      <Button
                        action={() => {
                          setEditing(plan);
                          console.log(JSON.stringify(plan, null, 2));
                          setStartsAt(plan.startsAt);
                          setEndsAt(plan.endsAt);
                        }}
                        type="outline"
                      >
                        Editar datas
                      </Button>
                      <Button action={() => cancelPlan(plan)} color="danger" type="outline">Cancelar</Button>
                    </>
                  )}
                  <Button action={() => navigation.push(duplicatePlanPath(plan))}>
                    Duplicar
                  </Button>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
      <Modal visible={editing !== null} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 }}>
          <View className="gap-3 p-4 bg-white rounded-3xl">
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
        </View>
      </Modal>
    </ScreenLayout>
  );
}
