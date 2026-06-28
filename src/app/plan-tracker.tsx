import Memory from '@/src/api/memory';
import Card from '@/src/components/card';
import { CheckinEnriched } from '@/types/checkin.type';
import { getColor } from '@/types/color.type';
import { PlanEnriched, PlanStatus } from '@/types/plan.type';
import { PlanRanking } from '@/types/ranking.type';
import Constants from 'expo-constants';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import CheckinWithReviewsCard from '../components/checkin-with-reviews-card';
import DaysOffCard from '../components/days-off-card';
import GradientView from '../components/gradient-view';
import Icon from '../components/icon';
import SideDrawer, { SideDrawerOpenButton } from '../components/side-drawer';
import useNavigation from '../hooks/useNavigation';
import { useRepositories } from '../hooks/useRepositories';
import { getDifferenceInDays } from '../utils/dateUtils';
import { formatInteger, formatPercentCompact } from '../utils/numberUtils';
import { toastErrorMessage, toastSuccessMessage } from '../utils/toastUtils';

const statusBarHeight = Constants.statusBarHeight;

export default function PlanTrackerScreen() {
  const { plan: planRepository, checkin: checkinRepository, ranking: rankingRepository, dayOff: dayOffRepository } = useRepositories();

  const [plan, setPlan] = useState<PlanEnriched | null>(null);
  const [checkins, setCheckins] = useState<CheckinEnriched[]>([]);
  const [ranking, setRanking] = useState<PlanRanking | null>(null);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigation = useNavigation();

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading)
      setLoading(true);

    try {
      const planId = await Memory.get('planId');
      const storedUserId = await Memory.get('userId') || '';

      if (!planId) {
        navigation.replace('/manage-plans');
        return;
      }

      setUserId(storedUserId);

      const dbPlan = await planRepository.getById(planId);

      if (!dbPlan) {
        await Memory.remove('planId');
        navigation.replace('/manage-plans');
        return;
      }

      const planCheckins = await checkinRepository.list({ planId });

      setPlan(dbPlan);
      setCheckins(planCheckins.sort((a, b) => b.date.localeCompare(a.date)));

      if (dbPlan.status === 'Running') {
        const planRanking = await rankingRepository.getByPlanId(planId, storedUserId || undefined);
        setRanking(planRanking);
      } else {
        setRanking(null);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [planRepository, checkinRepository, rankingRepository, navigation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(false);
  }, [fetchData]);

  const handleUpdateCheckIn = (updatedCheckIn: CheckinEnriched) => {
    setCheckins(current =>
      current.map(checkin =>
        checkin.id === updatedCheckIn.id ? updatedCheckIn : checkin
      )
    );
  };

  const handleUseDayOff = () => {
    if (!plan || !userId)
      return;

    Alert.alert(
      'Usar folga',
      'Deseja usar uma folga para hoje?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await dayOffRepository.useDayOff({
                planId: plan.id,
                userId,
                date: new Date(),
              });
              toastSuccessMessage('Folga registrada com sucesso');
              onRefresh();
            } catch {
              toastErrorMessage('Não foi possível usar a folga');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View
        className="items-center justify-center flex-1"
        style={{ marginTop: statusBarHeight, backgroundColor: getColor('gray-e') }}
      >
        <ActivityIndicator size="large" color={getColor('gray-6')} />
        <Text style={{ color: getColor('gray-6') }} className="mt-2 text-sm">Carregando plano...</Text>
      </View>
    );
  }

  if (!plan)
    return null;

  const isRunning = plan.status === 'Running';
  const currentUser = ranking?.currentUser;
  const daysSinceStart = getDifferenceInDays(new Date(), plan.startsAt);
  const totalDays = getDifferenceInDays(plan.startsAt, plan.endsAt);
  const streak = currentUser?.streak ?? 0;
  const position = currentUser?.position ?? 0;
  const checkinCount = currentUser?.checkinCount ?? 0;
  const totalCheckinCount = ranking?.totalCheckinCount ?? 0;
  const daysOffAvailable = ranking?.daysOffAvailable ?? 0;

  return (
    <View
      className="relative flex-1"
      style={{ backgroundColor: getColor('gray-e') }}
    >
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      <ScrollView
        style={{ flex: 1 }}
        className="flex-1"
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
          className="flex flex-col items-center justify-center w-full"
        >
          <View className="flex flex-row items-center justify-between w-full">
            <SideDrawerOpenButton setIsDrawerOpen={setIsDrawerOpen} />

            <View className="flex flex-col items-center justify-center">
              <Text style={{ color: getColor('white') }} className="text-xl font-bold text-center">
                BTY
              </Text>
            </View>

            <Pressable
              className="flex items-center justify-center w-20 h-20"
              onPress={() => navigation.push('/plan-settings')}
            >
              <Icon name="people" size={24} color="white" />
            </Pressable>
          </View>
          <View className="flex flex-col items-start w-full gap-2 px-4 py-1 mb-8 justify-evenly">
            <Text style={{ color: getColor('white') }} className="text-2xl font-bold">
              {plan.description ?? plan.habitName}
            </Text>
            <Text style={{ color: getColor('white') }} className="text-md">
              {`${7 - plan.daysOffPerWeek}x por semana`}
            </Text>
          </View>
        </GradientView>

        <View className="flex flex-col items-start justify-center gap-5 px-4 -mt-6">
          {isRunning ? (
            <>
              <View className="flex flex-row items-center justify-between flex-1 w-full gap-4">
                <Card className="flex flex-col items-start justify-center flex-1 w-full gap-1">
                  <View className="flex flex-row items-center justify-start gap-3">
                    <Icon type="font-awesome-5" name="fire" size={16} color="warning" />
                    <Text style={{ color: getColor('gray-7') }}>Sequência</Text>
                  </View>
                  <Text style={{ color: getColor('black') }} className="text-3xl font-bold">
                    {formatInteger(streak)}
                  </Text>
                  <Text style={{ color: getColor('gray-7') }} className="text-xs font-semibold">
                    dias seguidos
                  </Text>
                </Card>
                <Card className="flex flex-col items-start justify-center flex-1 w-full gap-1">
                  <View className="flex flex-row items-center justify-start gap-3">
                    <Icon type="font-awesome-5" name="award" size={16} color="violet" />
                    <Text style={{ color: getColor('gray-7') }}>Posição</Text>
                  </View>
                  <Text style={{ color: getColor('black') }} className="text-3xl font-bold">
                    #{formatInteger(position)}
                  </Text>
                  <Text style={{ color: getColor('gray-7') }} className="text-xs font-semibold">
                    de {plan.memberCount} pessoas
                  </Text>
                </Card>
              </View>

              <Card className="flex flex-col items-start justify-center flex-1 w-full gap-3">
                <View className="flex flex-row items-center justify-between w-full">
                  <Text style={{ color: getColor('black') }} className="font-bold text-md">Progresso</Text>
                  <Text style={{ color: getColor('violet') }} className="font-bold text-md">
                    {formatInteger(checkinCount)}/{formatInteger(totalCheckinCount)} dias
                  </Text>
                </View>
                <View style={{ backgroundColor: getColor('gray-e'), borderRadius: 9999, height: 10, width: '100%' }}>
                  <GradientView
                    style={{
                      flex: 1,
                      height: '100%',
                      borderRadius: 9999,
                      width: `${totalDays > 0 ? (100 * daysSinceStart) / totalDays : 0}%`,
                    }}
                  />
                </View>
                <View className="flex flex-row items-center justify-between w-full gap-2">
                  <Icon name="calendar-clear-outline" size={16} />
                  <Text style={{ color: getColor('gray-7') }} className="flex-1">
                    {`Termina em ${formatInteger(Math.max(0, totalDays - daysSinceStart))} ${totalDays - daysSinceStart === 1 ? 'dia' : 'dias'}`}
                  </Text>
                  <Text style={{ color: getColor('violet') }} className="font-semibold">
                    {formatPercentCompact(totalDays > 0 ? daysSinceStart / totalDays : 0)}
                  </Text>
                </View>
              </Card>
            </>
          ) : (
            <Card className="flex flex-col items-start justify-center w-full gap-1">
              <Text style={{ color: getColor('gray-7') }} className="text-sm font-semibold">
                Status do plano
              </Text>
              <Text style={{ color: getColor('black') }} className="text-lg font-bold">
                {getPlanStatusLabel(plan.status)}
              </Text>
            </Card>
          )}

          <DaysOffCard daysOffAvailable={daysOffAvailable} onUseDayOff={handleUseDayOff} />

          <View className="mt-2 -mb-5">
            <Text style={{ color: getColor('black') }} className="mb-3 text-lg font-extrabold">
              Check-ins Recentes
            </Text>
            {checkins.length === 0 && (
              <Text style={{ color: getColor('gray-7') }} className="text-xs">
                Faça seu primeiro check-in hoje para aparecer aqui!
              </Text>
            )}
          </View>

          {checkins.map((checkin) => (
            <CheckinWithReviewsCard
              key={checkin.id}
              checkin={checkin}
              onUpdate={handleUpdateCheckIn}
            />
          ))}
        </View>
      </ScrollView>

      {isRunning && (
      <Pressable
        style={{ backgroundColor: getColor('violet') }}
        onPress={() => navigation.push('/create-checkin')}
        className="absolute items-center justify-center w-16 h-16 overflow-hidden rounded-full shadow-xl bottom-4 right-4 active:opacity-80"
      >
        <GradientView className="flex flex-col items-center justify-center w-full h-full">
          <Icon name="camera" size={24} color="white" />
        </GradientView>
      </Pressable>
      )}
    </View>
  );
}

function getPlanStatusLabel(status: PlanStatus): string {
  switch (status) {
    case 'NotStarted':
      return 'Não iniciado';
    case 'Running':
      return 'Em andamento';
    case 'Finished':
      return 'Finalizado';
    case 'Cancelled':
      return 'Cancelado';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
