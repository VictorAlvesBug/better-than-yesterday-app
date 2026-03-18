import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';
import {
  formatInteger,
  formatIntegerCompact,
  formatMoneyCompact,
  formatPercent,
} from '../utils/numberUtils';
import ProfilePhoto from './profile-photo';

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
  totalCount,
}: RankingItemCardProps) {
  const checkinsPercent = checkinsCount / totalCount;
  return (
    <View className="flex flex-col items-center justify-between w-full gap-1 px-5 py-3 bg-white shadow-md rounded-2xl">
      <View className="flex flex-row items-center justify-between w-full gap-1">
        <View className="flex items-center justify-center w-10">
          {renderPosition(position)}
        </View>

        <View className="flex flex-row items-center justify-start flex-1 px-4">
          <ProfilePhoto name={name} size="large" />
          <View className="flex flex-col items-start justify-center flex-1 gap-1 px-4 py-2">
            <Text
              className="w-full text-base font-medium text-gray-800"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {name}
            </Text>
            <View className="flex flex-row items-center justify-center gap-1">
              <FontAwesome5 name="check-circle" size={14} color="#539d6a" />
              <Text className="text-xs text-gray-500" numberOfLines={1}>
                {`${formatInteger(checkinsCount)}/${formatInteger(totalCount)}`}
              </Text>
              <Text className="ml-3 text-xs text-gray-500" numberOfLines={1}>
                {`Streak: ${formatInteger(streak)}`}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex flex-col items-end justify-center gap-1">
          {renderPenaltyStatus(penalty)}
          <Text className="text-xs text-gray-500">
            {formatPercent(checkinsPercent)}
          </Text>
        </View>
      </View>
      <View className="w-full h-2 bg-gray-200 rounded-full">
        <LinearGradient
          colors={['#7c3aed', '#4f46e5']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            flex: 1,
            height: '100%',
            borderRadius: '9999px',
            width: `${checkinsPercent * 100}%`,
          }}
          className="h-full rounded-full w-[70%]"
        ></LinearGradient>
      </View>
    </View>
  );
}

function renderPosition(position: number) {
  const iconName = 'trophy';
  const iconSize = 32;
  switch (position) {
    case 1:
      return <FontAwesome6 name={iconName} size={iconSize} color="#dbaf36" />;
    case 2:
      return <FontAwesome6 name={iconName} size={iconSize} color="#a6aab4" />;
    case 3:
      return <FontAwesome6 name={iconName} size={iconSize} color="#d94f16" />;
    default:
      return (
        <Text className="text-[#9ca2b4] text-2xl font-bold">
          #{formatIntegerCompact(position)}
        </Text>
      );
  }
}

function renderPenaltyStatus(penalty: number) {
  return (
    <View className="flex flex-row items-center justify-center gap-1">
      {penalty <= 0 ? (
        <>
          <FontAwesome5 name="check-circle" size={16} color="#539d6a" />
          <Text className="text-sm text-[#539d6a] font-bold">Perfeito!</Text>
        </>
      ) : (
        <>
          <FontAwesome6 name="arrow-trend-down" size={14} color="#e24a55" />
          <Text className="text-sm font-bold text-[#e24a55]">
            {formatMoneyCompact(penalty)}
          </Text>
        </>
      )}
    </View>
  );
}
