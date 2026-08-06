import Memory from '@/src/api/memory';
import Card from '@/src/components/card';
import { CheckinEnriched } from '@/types/checkin.type';
import { getColor } from '@/types/color.type';
import { PlanEnriched, PlanStatus } from '@/types/plan.type';
import { PlanRankingWithCurrentUser } from '@/types/ranking.type';
import Constants from 'expo-constants';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import CheckinWithReviewsCard from '../components/checkin-with-reviews-card';
import DaysOffCard from '../components/days-off-card';
import GradientView from '../components/gradient-view';
import Icon from '../components/icon';
import PlanTrackerHeader from '../components/plan-tracker-header';
import ScreenLayout from '../components/screen-layout';
import SideDrawer from '../components/side-drawer';
import useNavigation from '../hooks/useNavigation';
import { useRepositories } from '../hooks/useRepositories';
import { DateOnly, getDate, getDateOnly, getDateToFront, getDifferenceInDays } from '../utils/dateUtils';
import { formatInteger, formatPercentCompact } from '../utils/numberUtils';
import { toastErrorMessage, toastSuccessMessage } from '../utils/toastUtils';

const statusBarHeight = Constants.statusBarHeight;

export default function PlanTrackerScreen() {
  const { plan: planRepository, checkin: checkinRepository, ranking: rankingRepository, dayOff: dayOffRepository } = useRepositories();

  const [plan, setPlan] = useState<PlanEnriched | null>(null);
  const [checkins, setCheckins] = useState<CheckinEnriched[]>([]);
  const [ranking, setRanking] = useState<PlanRankingWithCurrentUser | null>(null);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

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
        const planRanking = await rankingRepository.getByPlanIdAndUserId(planId, storedUserId);
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

  const resolvePeriodProgress = (startsAt: DateOnly, endsAt: DateOnly) => {
    const nowDateOnly = getDateOnly(new Date());
    const nowAtTime = getDate(nowDateOnly).getTime();
    const startsAtTime = getDate(startsAt).getTime();
    const endsAtTime = getDate(endsAt).getTime();
    const diff = nowAtTime - startsAtTime;
    const diffTotal = endsAtTime - startsAtTime;
    const percentage = (diff / diffTotal) * 100;
    return Math.max(0, Math.min(100, percentage));
  };

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
    <View className="flex-1">
      <ScreenLayout
        header={
          <PlanTrackerHeader
            plan={plan}
            scrollY={scrollY}
            setIsDrawerOpen={setIsDrawerOpen}
            onOpenSettings={() => navigation.push('/plan-settings')}
          />
        }
      >
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={getColor('violet')}
              colors={[getColor('violet')]}
            />
          }
        >
          <View className="flex flex-col gap-5 justify-center items-start px-4 mt-4">
            {isRunning ? (
              <>
                <View
                  className="flex flex-row flex-1 gap-4 justify-between items-center w-full"
                  style={{ zIndex: 10 }}
                >
                  <Card className="flex flex-col flex-1 gap-1 justify-center items-start w-full">
                    <View className="flex flex-row gap-3 justify-start items-center">
                      <Icon type="font-awesome-5" name="fire" size={16} color="orange" />
                      <Text style={{ color: getColor('black') }}>Sequência</Text>
                    </View>
                    <View className="flex flex-row gap-1 justify-start items-center">
                      <Text style={{ color: getColor('black') }} className="text-3xl font-bold">
                        {formatInteger(streak)}
                      </Text>
                    </View>
                    <Text style={{ color: getColor('gray-3') }} className="text-xs">
                      dias seguidos
                    </Text>
                  </Card>
                  <Card className="flex flex-col flex-1 gap-1 justify-center items-start w-full">
                    <View className="flex flex-row gap-3 justify-start items-center">
                      <Icon type="font-awesome-5" name="award" size={16} color="violet" />
                      <Text style={{ color: getColor('black') }}>Posição</Text>
                    </View>
                    <Text style={{ color: getColor('black') }} className="text-3xl font-bold">
                      #{formatInteger(position)}
                    </Text>
                    <Text style={{ color: getColor('gray-3') }} className="text-xs">
                      de {plan.memberCount} pessoas
                    </Text>
                  </Card>
                </View>

                <Card className="flex flex-col flex-1 gap-3 justify-center items-start w-full">
                  <View className="flex flex-row justify-between items-center w-full">
                    <Text style={{ color: getColor('black') }} className="text-md">Progresso</Text>
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
                  <View className="flex flex-row gap-2 justify-between items-center w-full">
                    <Icon name="calendar-clear-outline" size={16} />
                    <Text style={{ color: getColor('gray-3') }} className="flex-1">
                      {`Termina em ${formatInteger(Math.max(0, totalDays - daysSinceStart))} ${totalDays - daysSinceStart === 1 ? 'dia' : 'dias'}`}
                    </Text>
                    <Text style={{ color: getColor('violet') }} className="font-semibold">
                      {formatPercentCompact(totalDays > 0 ? daysSinceStart / totalDays : 0)}
                    </Text>
                  </View>

                  <View className="flex flex-row justify-between items-center w-full">
                    <View className="flex flex-col gap-1 justify-center items-start">
                      <Text style={{ color: getColor('gray-3') }} className="text-xs font-thin">
                        Início
                      </Text>
                      <Text style={{ color: getColor('gray-3') }} className="font-semibold">
                        {getDateToFront(plan.startsAt)}
                      </Text>
                    </View>
                    <View className="flex flex-col gap-1 justify-center items-end">
                      <Text style={{ color: getColor('gray-3') }} className="text-xs font-thin">
                        Fim
                      </Text>
                      <Text style={{ color: getColor('gray-3') }} className="font-semibold">
                        {getDateToFront(plan.endsAt)}
                      </Text>
                    </View>
                  </View>

                  <View className="flex flex-row justify-between items-center w-full">
                    <View className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor('gray-3') }} />
                    <View className="flex-1 h-[2px] flex flex-row justify-center items-center">
                      <View className="h-full" style={{ width: `${resolvePeriodProgress(plan.startsAt, plan.endsAt)}%`, backgroundColor: getColor('gray-3'), opacity: 1 }} />
                      <View className="flex-1 h-full" style={{ backgroundColor: getColor('gray-3'), opacity: 0.2 }} />
                    </View>
                    <View className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor('gray-3') }} />
                  </View>
                </Card>

              </>
            ) : (
              <Card className="flex flex-col gap-1 justify-center items-start w-full">
                <Text style={{ color: getColor('gray-3') }} className="text-sm font-semibold">
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
                <Text style={{ color: getColor('gray-3') }} className="text-sm">
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
        </Animated.ScrollView>

        {isRunning && (
          <Pressable
            style={{ backgroundColor: getColor('violet') }}
            onPress={() => navigation.push('/create-checkin')}
            className="overflow-hidden absolute right-4 bottom-4 justify-center items-center w-16 h-16 rounded-full shadow-xl active:opacity-80"
          >
            <GradientView className="flex flex-col justify-center items-center w-full h-full">
              <Icon name="camera" size={24} color="white" />
            </GradientView>
          </Pressable>
        )}
      </ScreenLayout>
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
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
