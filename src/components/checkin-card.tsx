import React from 'react';
import { Text, View } from 'react-native';

type CheckinCardProps = {
  participantName: string;
  date: string;
  title: string;
};

export default function CheckinCard({
  participantName,
  date,
  title,
}: CheckinCardProps) {
  return (
    <View className="flex flex-col items-start justify-center w-full gap-3 pb-4 overflow-hidden bg-white shadow-md rounded-xl">
      <View className="w-full bg-red-200 h-44"></View>

      <View className="flex flex-row items-center justify-start w-full gap-1 px-4">
        <View className="flex items-center justify-center w-10 h-10 bg-purple-700 rounded-full">
          <Text className="text-white text-md">
            {participantName
              .split(' ')
              .map((namePart) => namePart[0])
              .join('')}
          </Text>
        </View>
        <View className="flex flex-col items-start justify-center w-full px-4 py-2">
          <Text className="text-sm font-medium text-gray-800">
            {participantName}
          </Text>
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {date}
          </Text>
        </View>
      </View>

      <Text className="px-6 text-md">{title}</Text>
    </View>
  );
}
