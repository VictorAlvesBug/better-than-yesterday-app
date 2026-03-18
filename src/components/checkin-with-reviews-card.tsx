import { CheckinReview, CheckinStatus } from '@/types/checkin.type';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { formatDate } from '../utils/dateUtils';
import { formatIntegerCompact } from '../utils/numberUtils';
import ProfilePhoto from './profile-photo';

const unavailablePhotoUrl =
  'https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';

type CheckinWithReviewsCardProps = {
  name: string;
  date: string;
  title: string;
  photoUrl: string;
  status: CheckinStatus;
  reviews: CheckinReview[];
};

export default function CheckinWithReviewsCard({
  name,
  date,
  title,
  photoUrl,
  status,
  reviews,
}: CheckinWithReviewsCardProps) {
  return (
    <View className="flex flex-col items-start justify-center w-full gap-2 pb-4 overflow-hidden bg-white shadow-md rounded-2xl">
      <Image
        source={{ uri: photoUrl || unavailablePhotoUrl }}
        style={{ width: '100%', aspectRatio: '16/9' }}
        resizeMode="cover"
      />

      <View className="flex flex-row items-center justify-start w-full gap-1 px-4">
        <ProfilePhoto name={name} />
        <View className="flex flex-col items-start justify-center flex-1 px-4 py-2">
          <Text
            className="w-full text-base font-medium text-gray-800"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {name}
          </Text>
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {formatDate(date)}
          </Text>
        </View>
        {renderStatus(status)}
      </View>

      <Text className="px-6 text-md">{title}</Text>

      {reviews.length > 0 && (
        <>
          {
            <View className="w-[calc(100%-2rem)] h-[1px] bg-gray-300 mx-auto mt-3 mb-1"></View>
          }
          {renderReviews(reviews)}
        </>
      )}

      {status === 'Pending' && renderReviewButtons()}
    </View>
  );
}

function renderStatus(status: CheckinStatus) {
  const defaultClasses = 'px-3 py-1 font-semibold rounded-full';

  if (status === 'Pending')
    return (
      <Text className={`bg-[#fff7c6] text-[#aa8c50] ${defaultClasses}`}>
        Pendente
      </Text>
    );
  if (status === 'Validated')
    return (
      <Text className={`bg-[#d9ffea] text-[#4b795f] ${defaultClasses}`}>
        Validado
      </Text>
    );
  if (status === 'Rejected')
    return (
      <Text className={`bg-[#fceff1] text-[#bd405c] ${defaultClasses}`}>
        Rejeitado
      </Text>
    );
}

function renderReviews(reviews: CheckinReview[]) {
  const validationReviews = reviews.filter(
    (review) => review.status === 'Validated',
  );
  const rejectionReviews = reviews.filter(
    (review) => review.status === 'Rejected',
  );

  const validationText =
    validationReviews.length === 1 ? 'validação' : 'validações';
  const rejectionText =
    rejectionReviews.length === 1 ? 'rejeição' : 'rejeições';

  return (
    <View className="flex flex-row items-center justify-start w-full gap-4 px-6">
      {validationReviews.length > 0 && (
        <View className="flex flex-row items-center justify-center gap-2">
          <FontAwesome5 name="check-circle" size={14} color="#619b7a" />
          <Text className="text-[#619b7a] font-bold">
            {formatIntegerCompact(validationReviews.length)} {validationText}
          </Text>
        </View>
      )}
      {rejectionReviews.length > 0 && (
        <View className="flex flex-row items-center justify-center gap-2">
          <FontAwesome6 name="flag" size={14} color="#bd405c" />
          <Text className="text-[#bd405c] font-bold">
            {formatIntegerCompact(rejectionReviews.length)} {rejectionText}
          </Text>
        </View>
      )}
    </View>
  );
}

function renderReviewButtons() {
  return (
    <View className="flex flex-row items-center justify-between w-full gap-2 px-4">
      <Pressable className="bg-[#d9ffea] py-2 rounded-xl flex-1">
        <View className="flex flex-row items-center justify-center w-full gap-2">
          <FontAwesome5 name="check-circle" size={14} color="#619b7a" />
          <Text className="text-[#619b7a] font-bold">Validar</Text>
        </View>
      </Pressable>
      <Pressable className="bg-[#fceff1] px-4 py-2 rounded-xl flex-1">
        <View className="flex flex-row items-center justify-center w-full gap-2">
          <FontAwesome6 name="flag" size={14} color="#bd405c" />
          <Text className="text-[#bd405c] font-bold">Rejeitar</Text>
        </View>
      </Pressable>
    </View>
  );
}
