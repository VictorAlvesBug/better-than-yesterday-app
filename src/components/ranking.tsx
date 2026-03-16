import { RankingItem } from '@/types/ranking.type';
import React from 'react';
import { Text, View } from 'react-native';
import RankingItemCard from './ranking-item-card';

type RankingProps = 
{
  planId: string;
};

export default function Ranking({ planId }: RankingProps) {
  // TODO: Consulta do ranking do plano, pelo planId

  const totalCheckinsCount = 20;

  const rankingItems: RankingItem[] = [];
  rankingItems.push({
    position: 1,
    name: 'Maria Santos',
    checkinsCount: 20,
    penalty: 0,
    streak: 20,
  });
  rankingItems.push({
    position: 2,
    name: 'Carlos Lima',
    checkinsCount: 19,
    penalty: 10,
    streak: 15,
  });
  rankingItems.push({
    position: 3,
    name: 'João Silva',
    checkinsCount: 18,
    penalty: 20,
    streak: 12,
  });
  rankingItems.push({
    position: 4,
    name: 'Ana Costa',
    checkinsCount: 17,
    penalty: 30,
    streak: 10,
  });
  rankingItems.push({
    position: 5,
    name: 'Pedro Alves',
    checkinsCount: 16,
    penalty: 40,
    streak: 8,
  });

  return (
    <>
    {rankingItems.length === 0 && <View className="flex flex-row items-center justify-center gap-4">
            {/* <FontAwesome name="ban" size={20} color="#6b7280" /> */}
            <Text className="text-base text-gray-500">Check-ins insuficientes para ranking...</Text>
          </View>}
              { rankingItems.map(item => <RankingItemCard key={item.position} {...item} totalCount={totalCheckinsCount} />) }
    </>
  )
}
