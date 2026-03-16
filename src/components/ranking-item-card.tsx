import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { getInitials } from '../utils/stringUtils';

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
    <View className="flex flex-row items-center justify-between w-full gap-2 px-5 py-3 bg-white shadow-md rounded-2xl">
          {renderPosition(position)}
          
          <View className="flex flex-row items-center justify-start gap-1 px-4">
            <View className="flex items-center justify-center w-10 h-10 bg-purple-700 rounded-full">
              <Text className="text-base text-white">{getInitials(name)}</Text>
            </View>
            <View className="flex flex-col items-start justify-center flex-1 px-4 py-2">
              <Text className="text-base font-medium text-gray-800">{name}</Text>
              <View className="flex flex-row items-center justify-center gap-1">
                <FontAwesome5 name="check-circle" size={14} color="green" />
                <Text className="text-xs text-gray-500" numberOfLines={1}>
                {`${checkinsCount}/${totalCount}`}
              </Text><Text className="text-xs text-gray-500" numberOfLines={1}>
                {`Streak: ${checkinsCount}`}
              </Text>
              </View>
            </View>
          </View>

          <View className="flex flex-col items-end justify-center">
            <Text className="font-bold text-red-500 text-ms">R$ {penalty}</Text>
            <Text className="text-xs text-gray-500">{100*checkinsCount/totalCount}%</Text>
          </View>{/* falta a barra de porcentagem inferior */}
        </View>
  )
}

function renderPosition(position: number){
    const iconName = 'trophy';
    const iconSize = 32;
    switch (position){
        case 1:
            return <FontAwesome6 name={iconName} size={iconSize} color="#dbaf36"/>;
        case 2:
            return <FontAwesome6 name={iconName} size={iconSize} color="#a6aab4"/>;
        case 3:
            return <FontAwesome6 name={iconName} size={iconSize} color="#d94f16"/>;
        default:
            return <Text className="text-[#9ca2b4] text-2xl font-bold">#{position}</Text>;
    }
}