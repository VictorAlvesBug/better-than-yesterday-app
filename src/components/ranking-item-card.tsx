import { getColor } from '@/types/color.type';
import React from 'react';
import { Text, View } from 'react-native';
import {
  formatInteger,
  formatIntegerCompact,
  formatMoneyCompact,
  formatPercent,
} from '../utils/numberUtils';
import GradientView from './gradient-view';
import Icon from './icon';
import ProfilePhoto from './profile-photo';

type RankingItemCardProps = {
  position: number;
  name: string;
  checkinCount: number;
  penalty: number;
  streak: number;
  totalCount: number;
};

export default function RankingItemCard({
  position,
  name,
  checkinCount,
  penalty,
  streak,
  totalCount,
}: RankingItemCardProps) {
  const checkinsPercent = checkinCount / totalCount;
  return (
    <View className="flex flex-col items-center justify-between w-full gap-1 px-5 py-3 bg-white shadow-md rounded-2xl">
      <View className="flex flex-row items-center justify-between w-full gap-1">
        <View className="flex items-center justify-center w-12">
          {renderPosition(position)}
        </View>

        <View className="flex flex-row items-center justify-start flex-1 px-4">
          <ProfilePhoto name={name} size="large" />
          <View className="flex flex-col items-start justify-center flex-1 gap-1 px-4 py-2">
            <Text
              className="w-full text-base font-semibold"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {name}
            </Text>
            <View className="flex flex-row items-center justify-center gap-1">
              <Icon type="font-awesome-5" name="check-circle" size={12} color={"success"} />
              <Text style={{color: getColor("gray-7")}} className="text-xs" numberOfLines={1}>
                {`${formatInteger(checkinCount)}/${formatInteger(totalCount)}`}
              </Text>
              <Text style={{color: getColor("gray-7")}} className="ml-3 text-xs" numberOfLines={1}>
                {`Streak: ${formatInteger(streak)}`}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex flex-col items-end justify-center gap-1">
          {renderPenaltyStatus(penalty)}
          <Text style={{color: getColor("gray-7")}} className="text-xs">
            {formatPercent(checkinsPercent)}
          </Text>
        </View>
      </View>
      <View style={{backgroundColor: getColor("gray-e"), borderRadius: 9999, height: 8, width: "100%"}}>
        <GradientView
          style={{
            flex: 1,
            height: '100%',
            borderRadius: 9999,
            width: `${checkinsPercent * 100}%`,
          }} />
      </View>
    </View>
  );
}

function renderPosition(position: number) {
  const iconProps = {
    type: 'octicons' as const,
    name: 'trophy' as const,
    size: 32,
  };
  switch (position) {
    case 1:
      return <Icon {...iconProps} color={"gold"} />;
    case 2:
      return <Icon {...iconProps} color={"silver"} />;
    case 3:
      return <Icon {...iconProps} color={"bronze"} />;
    default:
      const positionLength = position.toString().length;
      const textSize =
        positionLength === 1 ? "text-2xl"
          : positionLength === 2 ? "text-xl"
            : positionLength === 3 ? "text-lg"
              : "text-base"
      return (
        <Text style={{color: getColor("gray-9")}} className={`${textSize} font-bold`}>
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
          <Icon type="font-awesome-5" name="check-circle" size={12} color={"success"} />
          <Text style={{
            color: getColor("success")
          }}
            className="text-sm font-bold">Perfeito!</Text>
        </>
      ) : (
        <>
          <Icon name="trending-down-outline" size={14} color={"danger"} />
          <Text style={{
           color: getColor("danger")
          }} className="text-sm font-bold">
            {formatMoneyCompact(penalty)}
          </Text>
        </>
      )}
    </View>
  );
}
