import { CheckinEnriched } from '@/types/checkin.type';
import { getColor } from '@/types/color.type';
import React from 'react';
import { Text, View } from 'react-native';
import { formatRelativeDateOnly } from '../utils/dateUtils';
import EvidencePhoto from './evidence-photo';
import ProfilePhoto from './profile-photo';

export default function CheckinCard({
  userName,
  userPhotoUrl,
  date,
  title,
  evidencePhotoUrl,
}: CheckinEnriched) {
  return (
    <View className="flex flex-col items-start justify-center w-full gap-2 pb-4 overflow-hidden bg-white shadow-md rounded-2xl">
      <EvidencePhoto uri={evidencePhotoUrl} />

      <View className="flex flex-row items-center justify-start w-full gap-1 px-4">
        <ProfilePhoto name={userName} photoUrl={userPhotoUrl} />
        <View className="flex flex-col items-start justify-center flex-1 px-4 py-2">
          <Text
            className="w-full text-base font-semibold"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {userName}
          </Text>
          <Text style={{color: getColor("gray-3")}} className="text-xs" numberOfLines={1}>
            {formatRelativeDateOnly(date)}
          </Text>
        </View>
      </View>

      <Text className="px-6 text-md">{title}</Text>
    </View>
  );
}
