import { PlanRanking, PlanRankingWithCurrentUser } from '@/types/ranking.type';
import { getColor } from '@/types/color.type';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Memory from '../api/memory';
import { useRepositories } from '../hooks/useRepositories';
import RankingItemCard from './ranking-item-card';
import useNavigation from '../hooks/useNavigation';

type RankingProps = {
  planId: string;
  userId?: string;
  refreshKey?: number;
};

export default function Ranking({ planId, userId: userIdProp, refreshKey = 0 }: RankingProps) {
  const { ranking: rankingRepository } = useRepositories();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState<PlanRankingWithCurrentUser | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const userId = userIdProp ?? (await Memory.get('userId')) ?? undefined;
        if (!userId) {
          navigation.replace('/login');
          return;
        }
        const data = await rankingRepository.getByPlanIdAndUserId(planId, userId);
        setRanking(data);
      } catch {
        setRanking(null);
      } finally {
        setLoading(false);
      }
    };

    if (planId)
      fetchRanking();
  }, [planId, userIdProp, refreshKey, rankingRepository]);

  console.log('test1');

  if (loading) {
    return (
      <View className="flex flex-row items-center justify-center w-full py-8">
        <ActivityIndicator size="large" color={getColor('gray-6')} />
      </View>
    );
  }
  console.log('test2');

  if (!ranking || ranking.items.length === 0) {
    return (
      <View className="flex flex-row items-center justify-center gap-4">
        <Text style={{ color: getColor('gray-4') }} className="text-base">
          Check-ins insuficientes para ranking...
        </Text>
      </View>
    );
  }
  console.log('test3');

  return (
    <View className="flex flex-col w-full gap-2">
      {ranking.items.map((item) => (
        <RankingItemCard
          key={item.userId}
          position={item.position}
          name={item.userName}
          photoUrl={item.photoUrl}
          isCurrentUser={item.userId === ranking.currentUser.userId}
          checkinCount={item.checkinCount}
          pendingCheckinCount={item.pendingCheckinCount}
          penalty={item.penalty}
          streak={item.streak}
          totalCount={ranking.totalCheckinCount}
        />
      ))}
    </View>
  );
}
