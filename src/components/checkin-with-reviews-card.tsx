import { CheckinReview, CheckinStatus } from '@/types/checkin.type';
import { getColor } from '@/types/common.type';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { formatRelativeDate } from '../utils/dateUtils';
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
          <Text style={{ color: getColor("dark-gray") }}
            className="w-full text-base font-medium"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {name}
          </Text>
          <Text style={{ color: getColor("gray") }} className="text-xs" numberOfLines={1}>
            {formatRelativeDate(date)}
          </Text>
        </View>
        {renderStatus(status)}
      </View>

      <Text className="px-6 text-md">{title}</Text>

      {(reviews.length > 0 || status === 'Pending') && <View style={{ backgroundColor: getColor("light-gray"), width: "90%", height: 0.5 }} className="mx-auto mt-3 mb-1"></View>}

      {reviews.length > 0 && renderReviews(reviews)}

      {status === 'Pending' && renderReviewButtons()}
    </View>
  );
}

function renderStatus(status: CheckinStatus) {
  const defaultClasses = 'px-3 py-1 font-semibold rounded-full text-sm';

  if (status === 'Pending')
    return (
      <Text style={{ backgroundColor: getColor("light-warning"), color: getColor("warning") }} className={`${defaultClasses}`}>
        Pendente
      </Text>
    );
  if (status === 'Validated')
    return (
      <Text style={{ backgroundColor: getColor("light-success"), color: getColor("success") }} className={`${defaultClasses}`}>
        Validado
      </Text>
    );
  if (status === 'Rejected')
    return (
      <Text style={{ backgroundColor: getColor("light-danger"), color: getColor("danger") }} className={`${defaultClasses}`}>
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
          <FontAwesome5 name="check-circle" size={14} color={getColor("success")} />
          <Text style={{ color: getColor("success") }} className="font-bold">
            {formatIntegerCompact(validationReviews.length)} {validationText}
          </Text>
        </View>
      )}
      {rejectionReviews.length > 0 && (
        <View className="flex flex-row items-center justify-center gap-2">
          <FontAwesome6 name="flag" size={14} color={getColor("danger")} />
          <Text style={{ color: getColor("danger") }} className="font-bold">
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
      <Pressable style={{ backgroundColor: getColor("light-success") }} className="py-2 rounded-xl flex-1">
        <View className="flex flex-row items-center justify-center w-full gap-2">
          <FontAwesome5 name="check-circle" size={14} color={getColor("success")} />
          <Text style={{ color: getColor("success") }} className="font-bold">Validar</Text>
        </View>
      </Pressable>
      <Pressable style={{ backgroundColor: getColor("light-danger") }} className="px-4 py-2 rounded-xl flex-1">
        <View className="flex flex-row items-center justify-center w-full gap-2">
          <FontAwesome6 name="flag" size={14} color={getColor("danger")} />
          <Text style={{ color: getColor("danger") }} className="font-bold">Rejeitar</Text>
        </View>
      </Pressable>
    </View>
  );
}
