import { CheckinEnriched, CheckinReview, CheckinStatus } from '@/types/checkin.type';
import { getColor } from '@/types/color.type';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import createCheckinRepository from '../api/checkinRepository';
import Memory from '../api/memory';
import { formatRelativeDateOnly } from '../utils/dateUtils';
import { formatIntegerCompact } from '../utils/numberUtils';
import Icon from './icon';
import ProfilePhoto from './profile-photo';

const unavailablePhotoUrl =
  'https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';

export default function CheckinWithReviewsCard(checkin: CheckinEnriched) {
  const {
  id,
  userName,
  date,
  title,
  photoUrl,
  status,
  reviews,
} = checkin;

  const checkinRepository = createCheckinRepository();

  const reviewAsValidated = async () => {
    const userId = await Memory.get('userId') || '';

    const review: CheckinReview = {
      reviewerId: userId,
      status: 'validated' // TODO: Validate string to 'validated' or 'rejected'
    }

    checkinRepository.saveReview(id, review);
  }

  const reviewAsRejected = async () => {
    const userId = await Memory.get('userId') || '';
    
    const review: CheckinReview = {
      reviewerId: userId,
      status: 'rejected' // TODO: Validate string to 'validated' or 'rejected'
    }

    checkinRepository.saveReview(id, review);
  }

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
          <Text className="w-full text-base font-medium"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {userName}
          </Text>
          <Text style={{ color: getColor("gray-7") }} className="text-xs" numberOfLines={1}>
            {formatRelativeDateOnly(date)}
          </Text>
        </View>
        {renderStatus(status)}
      </View>

      <Text className="px-6 text-md">{title}</Text>

      {(reviews.length > 0 || status === 'pending')
        && <View style={{ backgroundColor: getColor("gray-d"), width: "90%", height: 0.5 }} className="mx-auto mt-3 mb-1"></View>}

      {reviews.length > 0 && renderReviews(reviews)}

      {status === 'pending' && renderReviewButtons(reviewAsValidated, reviewAsRejected)}
    </View>
  );
}

function renderStatus(status: CheckinStatus) {
  const defaultClasses = 'px-3 py-1 font-semibold rounded-full text-sm';

  if (status === 'pending')
    return (
      <Text style={{ backgroundColor: getColor("light-warning"), color: getColor("warning") }} className={`${defaultClasses}`}>
        Pendente
      </Text>
    );
  if (status === 'validated')
    return (
      <Text style={{ backgroundColor: getColor("light-success"), color: getColor("success") }} className={`${defaultClasses}`}>
        Validado
      </Text>
    );
  if (status === 'rejected')
    return (
      <Text style={{ backgroundColor: getColor("light-danger"), color: getColor("danger") }} className={`${defaultClasses}`}>
        Rejeitado
      </Text>
    );
}

function renderReviews(reviews: CheckinReview[]) {
  const validationReviews = reviews.filter(
    (review) => review.status === 'validated',
  );
  const rejectionReviews = reviews.filter(
    (review) => review.status === 'rejected',
  );

  const validationText =
    validationReviews.length === 1 ? 'validação' : 'validações';
  const rejectionText =
    rejectionReviews.length === 1 ? 'rejeição' : 'rejeições';

  return (
    <View className="flex flex-row items-center justify-start w-full gap-4 px-6">
      {validationReviews.length > 0 && (
        <View className="flex flex-row items-center justify-center gap-2">
          <Icon type="font-awesome-5" name="check-circle" size={14} color={"success"} />
          <Text style={{ color: getColor("success") }} className="font-bold">
            {formatIntegerCompact(validationReviews.length)} {validationText}
          </Text>
        </View>
      )}
      {rejectionReviews.length > 0 && (
        <View className="flex flex-row items-center justify-center gap-2">
          <Icon type="font-awesome-6" name="flag" size={14} color={"danger"} />
          <Text style={{ color: getColor("danger") }} className="font-bold">
            {formatIntegerCompact(rejectionReviews.length)} {rejectionText}
          </Text>
        </View>
      )}
    </View>
  );
}

function renderReviewButtons(
  reviewAsValidated: () => Promise<void>,
  reviewAsRejected: () => Promise<void>
) {
  return (
    <View className="flex flex-row items-center justify-between w-full gap-2 px-4">
      <Pressable
        style={{ backgroundColor: getColor("light-success") }}
        onPress={reviewAsValidated}
        className="flex-1 py-2 rounded-xl">
        <View className="flex flex-row items-center justify-center w-full gap-2">
          <Icon type="font-awesome-5" name="check-circle" size={14} color={"success"} />
          <Text style={{ color: getColor("success") }} className="font-bold">Validar</Text>
        </View>
      </Pressable>
      <Pressable
        style={{ backgroundColor: getColor("light-danger") }}
        onPress={reviewAsRejected}
        className="flex-1 px-4 py-2 rounded-xl">
        <View className="flex flex-row items-center justify-center w-full gap-2">
          <Icon type="font-awesome-6" name="flag" size={14} color={"danger"} />
          <Text style={{ color: getColor("danger") }} className="font-bold">Rejeitar</Text>
        </View>
      </Pressable>
    </View>
  );
}
