import { PlanRanking } from '@/types/ranking.type';
import { getColor } from '@/types/color.type';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Memory from '../api/memory';
import { useRepositories } from '../hooks/useRepositories';
import RankingItemCard from './ranking-item-card';

type RankingProps = {
  planId: string;
  userId?: string;
  refreshKey?: number;
};

export default function Ranking({ planId, userId: userIdProp, refreshKey = 0 }: RankingProps) {
  const { ranking: rankingRepository } = useRepositories();
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState<PlanRanking | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const userId = userIdProp ?? (await Memory.get('userId')) ?? undefined;
        const data = await rankingRepository.getByPlanId(planId, userId);
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

  if (loading) {
    return (
      <View className="flex flex-row items-center justify-center w-full py-8">
        <ActivityIndicator size="large" color={getColor('gray-6')} />
      </View>
    );
  }

  if (!ranking || ranking.items.length === 0) {
    return (
      <View className="flex flex-row items-center justify-center gap-4">
        <Text style={{ color: getColor('gray-4') }} className="text-base">
          Check-ins insuficientes para ranking...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex flex-col w-full gap-2">
      {ranking.items.map((item) => (
        <RankingItemCard
          key={item.userId}
          position={item.position}
          name={item.userName}
          checkinCount={item.checkinCount}
          penalty={item.penalty}
          streak={item.streak}
          totalCount={ranking.totalCheckinCount}
        />
      ))}
    </View>
  );
}
