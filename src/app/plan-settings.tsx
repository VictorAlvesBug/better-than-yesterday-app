import Memory from '@/src/api/memory';
import { getColor } from '@/types/color.type';
import { PlanEnriched } from '@/types/plan.type';
import { Penalty } from '@/types/penalty.type';
import { PlanRanking } from '@/types/ranking.type';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  LayoutChangeEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/button';
import Card from '../components/card';
import CheckinsWithReviewsList from '../components/checkins-with-reviews-list';
import GradientView from '../components/gradient-view';
import Icon from '../components/icon';
import InviteLinkModal from '../components/invite-link-modal';
import Label from '../components/label';
import Ranking from '../components/ranking';
import PenaltiesCard from '../components/penalties-card';
import ScreenHeader from '../components/screen-header';
import ScreenLayout from '../components/screen-layout';
import { useRepositories } from '../hooks/useRepositories';
import useNavigation from '../hooks/useNavigation';
import {
  formatInteger,
  formatMoney,
  formatMoneyCompact,
  formatPercent,
} from '../utils/numberUtils';
import { toastSuccessMessage, toastErrorMessage } from '../utils/toastUtils';
import { getDateToFront } from '../utils/dateUtils';
import { duplicatePlanPath } from '../utils/planUtils';

const ADMIN_FEE_RATE = 0.1;

export default function PlanSettingsScreen() {
  const navigation = useNavigation();
  const { plan: planRepository, ranking: rankingRepository, penalty: penaltyRepository, checkin: checkinRepository } = useRepositories();
  const [currentTab, setCurrentTab] = useState<'ranking' | 'checkins' | 'reports'>('ranking');
  const [planId, setPlanId] = useState('');
  const [plan, setPlan] = useState<PlanEnriched | null>(null);
  const [ranking, setRanking] = useState<PlanRanking | null>(null);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [penaltiesLoading, setPenaltiesLoading] = useState(false);
  const [reports, setReports] = useState<{
    id: string;
    checkInId: string;
    checkInTitle?: string;
    evidencePhotoUrl?: string;
    reporterName?: string;
    reason: string;
  }[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [payingPenaltyId, setPayingPenaltyId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const translateX = useRef(new Animated.Value(0)).current;
  const [tabsWidth, setTabsWidth] = useState(0);

  const paidTotal = penalties.filter((penalty) => penalty.status === 'Paid').reduce((sum, penalty) => sum + penalty.amount, 0);
  const totalAdminFee = paidTotal * ADMIN_FEE_RATE;
  const rewardsPool = paidTotal - totalAdminFee;

  const handleTabsLayout = (e: LayoutChangeEvent) => {
    setTabsWidth(e.nativeEvent.layout.width);
  };

  const fetchRanking = useCallback(async (id: string) => {
    const userId = (await Memory.get('userId')) ?? undefined;
    if (!userId)
      return;
    const data = await rankingRepository.getByPlanIdAndUserId(id, userId);
    setRanking(data);
  }, [rankingRepository]);

  const fetchPenalties = useCallback(async (id: string) => {
    setPenaltiesLoading(true);
    try {
      const data = await penaltyRepository.listByPlanId(id);
      setPenalties(data);
    } finally {
      setPenaltiesLoading(false);
    }
  }, [penaltyRepository]);

  const fetchPlan = useCallback(async (showLoading = true) => {
    if (showLoading)
      setLoading(true);

    try {
      const storedPlanId = await Memory.get('planId') || '';
      const storedUserId = await Memory.get('userId') || '';
      setCurrentUserId(storedUserId);
      setPlanId(storedPlanId);

      if (!storedPlanId)
        return;

      const [dbPlan] = await Promise.all([
        planRepository.getById(storedPlanId),
        fetchRanking(storedPlanId),
        fetchPenalties(storedPlanId),
      ]);
      setPlan(dbPlan);
      const membership = await planRepository.getPlanMemberDetails(storedPlanId, storedUserId).catch(() => null);
      setIsMember(membership !== null);
      if (dbPlan.ownerId === storedUserId) {
        const foundReports = await checkinRepository.listReports(storedPlanId, storedUserId).catch(() => []);
        setReports(foundReports);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [planRepository, fetchRanking, fetchPenalties, checkinRepository]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    fetchPlan(false);
  }, [fetchPlan]);

  const isPlanOwner = plan?.ownerId === currentUserId;
  const tabCount = isPlanOwner ? 3 : 2;
  const tabWidth = tabsWidth / tabCount || 0;
  const tabIndex = currentTab === 'ranking' ? 0 : currentTab === 'checkins' ? 1 : 2;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: tabIndex * tabWidth,
      useNativeDriver: true,
    }).start();
  }, [tabIndex, tabWidth, translateX]);

  const userNamesById = ranking?.items.reduce<Record<string, string>>((acc, item) => {
    acc[item.userId] = item.userName;
    return acc;
  }, {}) ?? {};

  const handlePayPenalty = async (penaltyId: string) => {
    if (!planId || !currentUserId)
      return;

    setPayingPenaltyId(penaltyId);
    try {
      await penaltyRepository.pay(planId, penaltyId, currentUserId);
      toastSuccessMessage('Pagamento confirmado');
      await Promise.all([fetchRanking(planId), fetchPenalties(planId)]);
      setRefreshKey((k) => k + 1);
    } catch {
      toastErrorMessage('Não foi possível confirmar o pagamento');
    } finally {
      setPayingPenaltyId(null);
    }
  };

  const leavePlan = () => {
    if (!plan)
      return;

    Alert.alert('Sair do plano', 'Você deixa de participar deste plano.', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await planRepository.leave({ planId: plan.id, userId: currentUserId });
            toastSuccessMessage('Você saiu do plano');
            navigation.back();
          } catch {
            toastErrorMessage('Não foi possível sair do plano');
          }
        },
      },
    ]);
  };

  const cancelPlan = () => {
    if (!plan)
      return;

    Alert.alert('Cancelar plano', 'As multas pagas serão devolvidas e os membros serão removidos.', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar plano',
        style: 'destructive',
        onPress: async () => {
          try {
            await planRepository.cancel(plan.id);
            toastSuccessMessage('Plano cancelado');
            navigation.back();
          } catch {
            toastErrorMessage('Não foi possível cancelar o plano');
          }
        },
      },
    ]);
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
    <ScreenLayout
      header={
        <ScreenHeader
          title={plan.description ?? plan.habitName}
          titleSize="text-lg"
          right={
            <Pressable className="flex justify-center items-center w-20 h-20" onPress={() => setInviteOpen(true)}>
              <Icon name="share-social" size={24} color="white" />
            </Pressable>
          }
        >
          <View
            style={{ backgroundColor: getColor('opaque') }}
            className="flex flex-col items-start w-[90%] gap-2 p-4 mb-6 justify-evenly rounded-lg"
          >
            <Text style={{ color: getColor('white') }} className="font-thin">Pool de Recompensas</Text>
            <Text style={{ color: getColor('white') }} className="mb-1 text-3xl font-bold">
              {formatMoney(rewardsPool)}
            </Text>

            <View className="flex flex-row justify-evenly items-center w-full">
              <View className="flex flex-col gap-1 justify-center items-center">
                <Text style={{ color: getColor('white') }} className="text-xs font-thin">
                  Total Multas
                </Text>
                <Text style={{ color: getColor('white') }} className="font-semibold">
                  {formatMoneyCompact(paidTotal)}
                </Text>
              </View>
              <View className="flex flex-col gap-1 justify-center items-center">
                <Text style={{ color: getColor('white') }} className="text-xs font-thin">
                  Taxa Admin ({formatPercent(ADMIN_FEE_RATE)})
                </Text>
                <Text style={{ color: getColor('white') }} className="font-semibold">
                  {formatMoneyCompact(totalAdminFee)}
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
        </ScreenHeader>
      }
    >
      <ScrollView
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
        <View className="flex flex-col gap-4 justify-center items-center px-4 -mt-2 mb-4">
          <Card className="flex flex-col w-full gap-3">
            <View>
              <Label size="text-xs">Descrição</Label>
              <Text style={{ color: getColor('black') }} className="text-base">
                {plan.description ?? plan.habitName}
              </Text>
            </View>
            <View className="flex flex-row gap-4">
              <View className="flex-1">
                <Label size="text-xs">Início</Label>
                <Text style={{ color: getColor('black') }} className="text-base">
                  {getDateToFront(plan.startsAt)}
                </Text>
              </View>
              <View className="flex-1">
                <Label size="text-xs">Término</Label>
                <Text style={{ color: getColor('black') }} className="text-base">
                  {getDateToFront(plan.endsAt)}
                </Text>
              </View>
            </View>
            <View className="flex flex-row gap-4">
              <View className="flex-1">
                <Label size="text-xs">Tipo</Label>
                <Text style={{ color: getColor('black') }} className="text-base">
                  {plan.type === 'Private' ? 'Privado' : 'Público'}
                </Text>
              </View>
              <View className="flex-1">
                <Label size="text-xs">Frequência</Label>
                <Text style={{ color: getColor('black') }} className="text-base">
                  {`${7 - plan.daysOffPerWeek}x por semana`}
                </Text>
              </View>
            </View>
            <View>
              <Label size="text-xs">Multa</Label>
              <Text style={{ color: getColor('black') }} className="text-base">
                {formatMoney(plan.penaltyValue)}
              </Text>
            </View>
          </Card>

          {plan.coverPhotoUrl ? (
            <Image source={{ uri: plan.coverPhotoUrl }} style={{ width: '100%', height: 160, borderRadius: 16 }} />
          ) : null}

          <Button action={() => navigation.push(duplicatePlanPath(plan))} type="outline">Duplicar</Button>
          {isMember && (
            <Button action={leavePlan} color="danger" type="outline">Sair</Button>
          )}
          {isPlanOwner && (
            <Button action={cancelPlan} color="danger">Cancelar plano</Button>
          )}

          {isPlanOwner && (
            <PenaltiesCard
              penalties={penalties}
              loading={penaltiesLoading}
              userNamesById={userNamesById}
              canConfirmPayment={true}
              onPayPenalty={handlePayPenalty}
              payingPenaltyId={payingPenaltyId}
            />
          )}

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
            {isPlanOwner && (
              <Pressable className="flex-1 h-full" onPress={() => setCurrentTab('reports')}>
                <View className="flex-1 justify-center items-center mx-1 rounded-xl">
                  <Text
                    style={{ color: getColor(currentTab === 'reports' ? 'white' : 'gray-7') }}
                    className="text-lg font-semibold"
                  >
                    Denúncias
                  </Text>
                </View>
              </Pressable>
            )}
          </View>

          {currentTab === 'ranking' && planId && (
            <Ranking planId={planId} refreshKey={refreshKey} />
          )}
          {currentTab === 'checkins' && planId && (
            <CheckinsWithReviewsList planId={planId} refreshKey={refreshKey} />
          )}
          {currentTab === 'reports' && isPlanOwner && (
            <ReportsByCheckIn reports={reports} />
          )}
        </View>
      </ScrollView>
      <InviteLinkModal visible={inviteOpen} planId={plan.id} onClose={() => setInviteOpen(false)} />
    </ScreenLayout>
  );
}

function ReportsByCheckIn({ reports }: {
  reports: {
    id: string;
    checkInId: string;
    checkInTitle?: string;
    evidencePhotoUrl?: string;
    reporterName?: string;
    reason: string;
  }[];
}) {
  const groups = Object.values(reports.reduce<Record<string, {
    checkInId: string;
    title: string;
    photo?: string;
    items: typeof reports;
  }>>((groupsByCheckIn, report) => {
    const current = groupsByCheckIn[report.checkInId] ?? {
      checkInId: report.checkInId,
      title: report.checkInTitle || 'Check-in',
      photo: report.evidencePhotoUrl,
      items: [],
    };
    current.items.push(report);
    groupsByCheckIn[report.checkInId] = current;
    return groupsByCheckIn;
  }, {}));

  if (groups.length === 0) {
    return (
      <Text style={{ color: getColor('gray-3') }} className="text-sm">
        Nenhuma denúncia neste plano.
      </Text>
    );
  }

  return (
    <View className="w-full gap-3">
      {groups.map((group) => (
        <Card key={group.checkInId} className="flex flex-col w-full gap-2">
          {group.photo ? (
            <Image source={{ uri: group.photo }} style={{ width: '100%', height: 140, borderRadius: 12 }} />
          ) : null}
          <Text style={{ color: getColor('black') }} className="text-base font-semibold">{group.title}</Text>
          {group.items.map((report) => (
            <View key={report.id}>
              <Text style={{ color: getColor('gray-3') }} className="text-xs">{report.reporterName || 'Alguém'}</Text>
              <Text style={{ color: getColor('black') }} className="text-sm">{report.reason}</Text>
            </View>
          ))}
        </Card>
      ))}
    </View>
  );
}
