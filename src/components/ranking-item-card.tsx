import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

type RankingItemCardProps = {
    position: number;
    name: string;
    checkinsCount: number;
    penalty: number;
    streak: number;
    totalCount: number;
};

export default function RankingItemCard({
    position,
    name,
    checkinsCount,
    penalty,
    streak,
    totalCount
}: RankingItemCardProps) {
  return (
    <View className="flex flex-row items-center justify-center w-full gap-2 p-4 bg-white shadow-md rounded-2xl">
          {renderPosition(position)}
    
          
    
          <Text className="px-6 text-md">{name}</Text>
        </View>
  )
}

function renderPosition(position: number){
    const iconName = 'trophy-outline';
    const iconSize = 32;
    switch (position){
        case 1:
            return <Ionicons name={iconName} size={iconSize} color="#dbaf36"/>;
        case 2:
            return <Ionicons name={iconName} size={iconSize} color="#a6aab4"/>;
        case 3:
            return <Ionicons name={iconName} size={iconSize} color="#d94f16"/>;
        default:
            return <Text className="text-[#9ca2b4] text-2xl font-bold">#{position}</Text>;
    }
}