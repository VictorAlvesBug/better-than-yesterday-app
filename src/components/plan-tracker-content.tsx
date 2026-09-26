import Memory from '@/src/api/memory';
import Card from '@/src/components/card';
import { CheckinEnriched } from '@/types/checkin.type';
import { Penalty } from '@/types/penalty.type';
import { getColor } from '@/types/color.type';
import { PlanEnriched } from '@/types/plan.type';
import { PlanRankingWithCurrentUser } from '@/types/ranking.type';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import CheckinWithReviewsCard from './checkin-with-reviews-card';
import DaysOffCard from './days-off-card';
import PenaltiesCard from './penalties-card';
import GradientView from './gradient-view';
import Icon from './icon';
import PlanTrackerHeader from './plan-tracker-header';
import Ranking from './ranking';
import ScreenLayout from './screen-layout';
import SideDrawer from './side-drawer';
import useNavigation from '../hooks/useNavigation';
import { useRepositories } from '../hooks/useRepositories';
import {
  DateOnly,
  formatRelativeDateOnly,
  getDate,
  getDateOnly,
  getDateToFront,
  getDifferenceInDays,
} from '../utils/dateUtils';
import { formatInteger, formatPercentCompact } from '../utils/numberUtils';

type PlanTrackerContentProps = {
  plan: PlanEnriched;
  refreshing: boolean;
  onRefresh: () => void;
  refreshKey: number;
};

export default function PlanTrackerContent({
  plan,
  refreshing,
  onRefresh,
  refreshKey,
}: PlanTrackerContentProps) {
  const {
    plan: planRepository,
    checkin: checkinRepository,
    ranking: rankingRepository,
    penalty: penaltyRepository,
  } = useRepositories();
  const navigation = useNavigation();

  const [checkins, setCheckins] = useState<CheckinEnriched[]>([]);
  const [ranking, setRanking] = useState<PlanRankingWithCurrentUser | null>(null);
  const [memberPenalties, setMemberPenalties] = useState<Penalty[]>([]);
  const [isMemberBlocked, setIsMemberBlocked] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchContentData = useCallback(async () => {
    const userId = (await Memory.get('userId')) || '';

    if (plan.status === 'Running') {
      const planCheckins = await checkinRepository.list({ planId: plan.id });
      setCheckins(planCheckins.sort((a, b) => b.date.localeCompare(a.date)));

      if (!userId) {
        setRanking(null);
        setMemberPenalties([]);
        setIsMemberBlocked(false);
        return;
      }

      const planRanking = await rankingRepository.getByPlanIdAndUserId(plan.id, userId);
      setRanking(planRanking);

      const memberDetails = await planRepository.getPlanMemberDetails(plan.id, userId);
      setIsMemberBlocked(memberDetails.status === 'Blocked');

      if (memberDetails.status === 'Blocked' || planRanking.currentUser.penalty > 0) {
        const penalties = await penaltyRepository.listByPlanMember(plan.id, userId);
        setMemberPenalties(penalties);
      } else {
        setMemberPenalties([]);
      }
      return;
    }

    setCheckins([]);
    setRanking(null);
    setMemberPenalties([]);
    setIsMemberBlocked(false);
  }, [
    plan.id,
    plan.status,
    checkinRepository,
    rankingRepository,
    planRepository,
    penaltyRepository,
  ]);

  useEffect(() => {
    fetchContentData();
  }, [fetchContentData, refreshKey]);

  const handleUpdateCheckIn = (updatedCheckIn: CheckinEnriched) => {
    setCheckins((current) =>
      current.map((checkin) =>
        checkin.id === updatedCheckIn.id ? updatedCheckIn : checkin
      )
    );
  };

  const isRunning = plan.status === 'Running';

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
            {plan.status === 'NotStarted' && <NotStartedPlanView plan={plan} />}
            {plan.status === 'Running' && (
              <RunningPlanView
                plan={plan}
                ranking={ranking}
                checkins={checkins}
                memberPenalties={memberPenalties}
                isMemberBlocked={isMemberBlocked}
                onUpdateCheckIn={handleUpdateCheckIn}
              />
            )}
            {plan.status === 'Finished' && (
              <FinishedPlanView planId={plan.id} refreshKey={refreshKey} />
            )}
            {plan.status === 'Cancelled' && <CancelledPlanView />}
          </View>
        </Animated.ScrollView>

        {isRunning && !isMemberBlocked && (
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

function NotStartedPlanView({ plan }: { plan: PlanEnriched }) {
  return (
    <Card className="flex flex-col gap-1 justify-center items-start w-full">
      <Text style={{ color: getColor('black') }} className="text-lg font-bold">
        Prepare-se!
      </Text>
      <Text style={{ color: getColor('gray-3') }} className="text-base">
        O desafio começa {formatRelativeDateOnly(plan.startsAt).toLowerCase()} ({getDateToFront(plan.startsAt)})
      </Text>
    </Card>
  );
}

function RunningPlanView({
  plan,
  ranking,
  checkins,
  memberPenalties,
  isMemberBlocked,
  onUpdateCheckIn,
}: {
  plan: PlanEnriched;
  ranking: PlanRankingWithCurrentUser | null;
  checkins: CheckinEnriched[];
  memberPenalties: Penalty[];
  isMemberBlocked: boolean;
  onUpdateCheckIn: (checkin: CheckinEnriched) => void;
}) {
  const currentUser = ranking?.currentUser;
  const daysSinceStart = getDifferenceInDays(new Date(), plan.startsAt);
  const totalDays = getDifferenceInDays(plan.startsAt, plan.endsAt);
  const streak = currentUser?.streak ?? 0;
  const position = currentUser?.position ?? 0;
  const checkinCount = currentUser?.checkinCount ?? 0;
  const totalCheckinCount = ranking?.totalCheckinCount ?? 0;
  const daysOffAvailable = ranking?.daysOffAvailable ?? 0;

  return (
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
            <View
              className="h-full"
              style={{
                width: `${resolvePeriodProgress(plan.startsAt, plan.endsAt)}%`,
                backgroundColor: getColor('gray-3'),
                opacity: 1,
              }}
            />
            <View className="flex-1 h-full" style={{ backgroundColor: getColor('gray-3'), opacity: 0.2 }} />
          </View>
          <View className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor('gray-3') }} />
        </View>
      </Card>

      <DaysOffCard daysOffAvailable={daysOffAvailable} />

      {(isMemberBlocked || memberPenalties.some((p) => p.status === 'Pending')) && (
        <PenaltiesCard penalties={memberPenalties} />
      )}

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
          onUpdate={onUpdateCheckIn}
        />
      ))}
    </>
  );
}

function FinishedPlanView({ planId, refreshKey }: { planId: string; refreshKey: number }) {
  return (
    <>
      <Card className="flex flex-col gap-1 justify-center items-start w-full">
        <Text style={{ color: getColor('black') }} className="text-lg font-bold">
          ✅ Desafio finalizado
        </Text>
      </Card>
      <View className="w-full mt-2">
        <Text style={{ color: getColor('black') }} className="mb-3 text-lg font-extrabold">
          Ranking
        </Text>
        <Ranking planId={planId} refreshKey={refreshKey} />
      </View>
    </>
  );
}

function CancelledPlanView() {
  return (
    <Card className="flex flex-col gap-1 justify-center items-start w-full">
      <Text style={{ color: getColor('black') }} className="text-lg font-bold">
        Ops, este plano não existe mais.
      </Text>
    </Card>
  );
}

function resolvePeriodProgress(startsAt: DateOnly, endsAt: DateOnly) {
  const nowDateOnly = getDateOnly(new Date());
  const nowAtTime = getDate(nowDateOnly).getTime();
  const startsAtTime = getDate(startsAt).getTime();
  const endsAtTime = getDate(endsAt).getTime();
  const diff = nowAtTime - startsAtTime;
  const diffTotal = endsAtTime - startsAtTime;
  const percentage = (diff / diffTotal) * 100;
  return Math.max(0, Math.min(100, percentage));
}
