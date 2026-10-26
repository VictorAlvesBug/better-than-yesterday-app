import Memory from '@/src/api/memory';
import Card from '@/src/components/card';
import { CheckinEnriched } from '@/types/checkin.type';
import { Penalty } from '@/types/penalty.type';
import { getColor } from '@/types/color.type';
import { ChallengeEnriched } from '@/types/challenge.type';
import { ChallengeRankingWithCurrentUser } from '@/types/ranking.type';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, RefreshControl, Text, View } from 'react-native';
import { Button } from './button';
import CheckinWithReviewsCard from './checkin-with-reviews-card';
import DaysOffCard from './days-off-card';
import PenaltiesCard from './penalties-card';
import GradientView from './gradient-view';
import Icon from './icon';
import ChallengeTrackerHeader from './challenge-tracker-header';
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
  getDateOnlyWithOffset,
  getDateToFront,
  getDifferenceInDays,
} from '../utils/dateUtils';
import { formatInteger, formatPercentCompact } from '../utils/numberUtils';
import { duplicateChallengePath } from '../utils/challengeUtils';

type ChallengeTrackerContentProps = {
  challenge: ChallengeEnriched;
  refreshing: boolean;
  onRefresh: () => void;
  refreshKey: number;
};

export default function ChallengeTrackerContent({
  challenge,
  refreshing,
  onRefresh,
  refreshKey,
}: ChallengeTrackerContentProps) {
  const {
    challenge: challengeRepository,
    checkin: checkinRepository,
    ranking: rankingRepository,
    penalty: penaltyRepository,
  } = useRepositories();
  const navigation = useNavigation();

  const [checkins, setCheckins] = useState<CheckinEnriched[]>([]);
  const [ranking, setRanking] = useState<ChallengeRankingWithCurrentUser | null>(null);
  const [memberPenalties, setMemberPenalties] = useState<Penalty[]>([]);
  const [isMemberBlocked, setIsMemberBlocked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [isViewer, setIsViewer] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchContentData = useCallback(async () => {
    const userId = (await Memory.get('userId')) || '';
    setCurrentUserId(userId);

    if (challenge.status === 'Running') {
      const challengeCheckins = await checkinRepository.list({ challengeId: challenge.id });
      setCheckins(challengeCheckins.sort((a, b) => b.date.localeCompare(a.date)));

      if (!userId) {
        setRanking(null);
        setMemberPenalties([]);
        setIsMemberBlocked(false);
        return;
      }

      const challengeRanking = await rankingRepository.getByChallengeIdAndUserId(challenge.id, userId);
      setRanking(challengeRanking);

      let memberDetails;
      try {
        memberDetails = await challengeRepository.getChallengeMemberDetails(challenge.id, userId);
      } catch {
        setIsViewer(true);
        setIsMemberBlocked(false);
        setMemberPenalties([]);
        return;
      }

      setIsViewer(false);
      setIsMemberBlocked(memberDetails.status === 'Blocked');

      if (memberDetails.status === 'Blocked' || challengeRanking.currentUser.penalty > 0) {
        const penalties = await penaltyRepository.listByChallengeMember(challenge.id, userId);
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
    challenge.id,
    challenge.status,
    checkinRepository,
    rankingRepository,
    challengeRepository,
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

  const isRunning = challenge.status === 'Running';
  const today = getDateOnly();
  const yesterday = getDateOnlyWithOffset(-1);
  const yesterdayAllowed = yesterday >= challenge.startsAt;
  const ownCheckins = checkins.filter((checkin) => checkin.userId === currentUserId);
  const hasToday = ownCheckins.some((checkin) => getDateOnly(checkin.date) === today);
  const hasYesterday = ownCheckins.some((checkin) => getDateOnly(checkin.date) === yesterday);
  const pendingDaysDone = hasToday && (!yesterdayAllowed || hasYesterday);
  const showCheckinFab = isRunning && !isMemberBlocked && !isViewer && !!currentUserId && !pendingDaysDone;

  return (
    <View className="flex-1">
      <ScreenLayout
        header={
          <ChallengeTrackerHeader
            challenge={challenge}
            scrollY={scrollY}
            setIsDrawerOpen={setIsDrawerOpen}
            onOpenSettings={() => navigation.push('/challenge-settings')}
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
            {challenge.coverPhotoUrl ? (
              <Image source={{ uri: challenge.coverPhotoUrl }} style={{ width: '100%', height: 160, borderRadius: 16 }} />
            ) : null}
            <Button action={() => navigation.push(duplicateChallengePath(challenge))} type="outline">Repetir desafio</Button>
            {challenge.status === 'NotStarted' && <NotStartedChallengeView challenge={challenge} />}
            {challenge.status === 'Running' && (
              <RunningChallengeView
                challenge={challenge}
                ranking={ranking}
                checkins={checkins}
                memberPenalties={memberPenalties}
                isMemberBlocked={isMemberBlocked}
                readOnly={isViewer}
                onUpdateCheckIn={handleUpdateCheckIn}
              />
            )}
            {challenge.status === 'Finished' && (
              <FinishedChallengeView challengeId={challenge.id} refreshKey={refreshKey} />
            )}
            {challenge.status === 'Cancelled' && <CancelledChallengeView />}
          </View>
        </Animated.ScrollView>

        {showCheckinFab && (
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

function NotStartedChallengeView({ challenge }: { challenge: ChallengeEnriched }) {
  const startHasArrived = challenge.startsAt <= getDateOnly();
  const startsTomorrow = challenge.startsAt === getDateOnlyWithOffset(1);
  const lacksQuorum = challenge.memberCount < 2;
  return (
    <Card className="flex flex-col gap-1 justify-center items-start w-full">
      <Text style={{ color: getColor('black') }} className="text-lg font-bold">
        Esquenta o motor!
      </Text>
      <Text style={{ color: getColor('gray-3') }} className="text-base">
        O desafio começa {formatRelativeDateOnly(challenge.startsAt).toLowerCase()} ({getDateToFront(challenge.startsAt)})
      </Text>
      {lacksQuorum && startsTomorrow && (
        <Text style={{ color: getColor('dark-orange') }} className="text-sm">
          Falta um jogador para o apito de amanhã.
        </Text>
      )}
      {lacksQuorum && startHasArrived && (
        <Text style={{ color: getColor('dark-orange') }} className="text-sm">
          Faltam dois jogadores para começar. O dono pode adiar ou encerrar em Meus desafios.
        </Text>
      )}
    </Card>
  );
}

function RunningChallengeView({
  challenge,
  ranking,
  checkins,
  memberPenalties,
  isMemberBlocked,
  readOnly = false,
  onUpdateCheckIn,
}: {
  challenge: ChallengeEnriched;
  ranking: ChallengeRankingWithCurrentUser | null;
  checkins: CheckinEnriched[];
  memberPenalties: Penalty[];
  isMemberBlocked: boolean;
  readOnly?: boolean;
  onUpdateCheckIn: (checkin: CheckinEnriched) => void;
}) {
  const [pixCode, setPixCode] = useState<string | null>(null);
  const { penalty: penaltyRepository } = useRepositories();
  const currentUser = ranking?.currentUser;
  const daysSinceStart = getDifferenceInDays(new Date(), challenge.startsAt);
  const totalDays = getDifferenceInDays(challenge.startsAt, challenge.endsAt);
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
            de {challenge.memberCount} pessoas
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
              {getDateToFront(challenge.startsAt)}
            </Text>
          </View>
          <View className="flex flex-col gap-1 justify-center items-end">
            <Text style={{ color: getColor('gray-3') }} className="text-xs font-thin">
              Fim
            </Text>
            <Text style={{ color: getColor('gray-3') }} className="font-semibold">
              {getDateToFront(challenge.endsAt)}
            </Text>
          </View>
        </View>

        <View className="flex flex-row justify-between items-center w-full">
          <View className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor('gray-3') }} />
          <View className="flex-1 h-[2px] flex flex-row justify-center items-center">
            <View
              className="h-full"
              style={{
                width: `${resolvePeriodProgress(challenge.startsAt, challenge.endsAt)}%`,
                backgroundColor: getColor('gray-3'),
                opacity: 1,
              }}
            />
            <View className="flex-1 h-full" style={{ backgroundColor: getColor('gray-3'), opacity: 0.2 }} />
          </View>
          <View className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor('gray-3') }} />
        </View>
      </Card>

      {!readOnly && <DaysOffCard daysOffAvailable={daysOffAvailable} />}

      {(isMemberBlocked || memberPenalties.some((p) => p.status === 'Pending')) && (
        <PenaltiesCard
          penalties={memberPenalties}
          onPayWithPix={async (penaltyId) => {
            const userId = await Memory.get('userId') || '';
            const charge = await penaltyRepository.createPixCharge(challenge.id, penaltyId, userId);
            setPixCode(charge.copyAndPaste);
          }}
        />
      )}
      {pixCode && (
        <Card className="w-full gap-2">
          <Text style={{ color: getColor('black') }} className="text-sm font-semibold">Pix copia e cola</Text>
          <Text style={{ color: getColor('gray-3') }} className="text-xs">{pixCode}</Text>
        </Card>
      )}

      <View className="mt-2 -mb-5">
        <Text style={{ color: getColor('black') }} className="mb-3 text-lg font-extrabold">
          Check-ins Recentes
        </Text>
        {checkins.length === 0 && (
          <Text style={{ color: getColor('gray-3') }} className="text-sm">
            Faça o primeiro check-in e entra no placar!
          </Text>
        )}
      </View>

      {checkins.map((checkin) => (
        <CheckinWithReviewsCard
          key={checkin.id}
          checkin={checkin}
          onUpdate={onUpdateCheckIn}
          readOnly={readOnly}
        />
      ))}
    </>
  );
}

function FinishedChallengeView({ challengeId, refreshKey }: { challengeId: string; refreshKey: number }) {
  return (
    <>
      <Card className="flex flex-col gap-1 justify-center items-start w-full">
        <Text style={{ color: getColor('black') }} className="text-lg font-bold">
          Missão cumprida
        </Text>
      </Card>
      <View className="w-full mt-2">
        <Text style={{ color: getColor('black') }} className="mb-3 text-lg font-extrabold">
          Ranking
        </Text>
        <Ranking challengeId={challengeId} refreshKey={refreshKey} />
      </View>
    </>
  );
}

function CancelledChallengeView() {
  return (
    <Card className="flex flex-col gap-1 justify-center items-start w-full">
      <Text style={{ color: getColor('black') }} className="text-lg font-bold">
        Essa arena já fechou.
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
