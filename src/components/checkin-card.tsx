import { CheckinEnriched } from '@/types/checkin.type';
import { getColor } from '@/types/color.type';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { formatRelativeDateOnly } from '../utils/dateUtils';
import ProfilePhoto from './profile-photo';

const unavailablePhotoUrl =
  'https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';

export default function CheckinCard({
  userName,
  date,
  title,
  photoUrl,
}: CheckinEnriched) {
  return (
    <View className="flex flex-col items-start justify-center w-full gap-2 pb-4 overflow-hidden bg-white shadow-md rounded-2xl">
      <Image
        source={{ uri: photoUrl || unavailablePhotoUrl }}
        style={{ width: '100%', aspectRatio: '16/9' }}
        resizeMode="cover"
      />

      <View className="flex flex-row items-center justify-start w-full gap-1 px-4">
        <ProfilePhoto name={userName} />
        <View className="flex flex-col items-start justify-center flex-1 px-4 py-2">
          <Text
            className="w-full text-base font-semibold"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {userName}
          </Text>
          <Text style={{color: getColor("gray-7")}} className="text-xs" numberOfLines={1}>
            {formatRelativeDateOnly(date)}
          </Text>
        </View>
      </View>

      <Text className="px-6 text-md">{title}</Text>
    </View>
  );
}
