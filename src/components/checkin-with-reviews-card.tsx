import { CheckinEnriched, CheckinReview, CheckinStatus } from '@/types/checkin.type';
import { getColor } from '@/types/color.type';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import createCheckinRepository from '../api/checkinRepository';
import Memory from '../api/memory';
import { formatRelativeDateTime } from '../utils/dateUtils';
import { formatIntegerCompact } from '../utils/numberUtils';
import EvidencePhoto from './evidence-photo';
import Icon from './icon';
import ProfilePhoto from './profile-photo';
import useNavigation from '../hooks/useNavigation';
import { Button } from './button';
import { toastErrorMessage, toastSuccessMessage } from '../utils/toastUtils';

const REPLACE_LEAD_MS = 4 * 60 * 60 * 1000;

function canReplaceCheckIn(
  userId: string,
  checkinUserId: string,
  isReplacement: boolean,
  reviewClosesAt: string | null | undefined,
) {
  if (userId !== checkinUserId || isReplacement || !reviewClosesAt)
    return false;

  return new Date(reviewClosesAt).getTime() - Date.now() >= REPLACE_LEAD_MS;
}

type CheckinWithReviewsCardProps = {
  checkin: CheckinEnriched;
  onUpdate: (checkin: CheckinEnriched) => void;
  readOnly?: boolean;
}

export default function CheckinWithReviewsCard({ checkin, onUpdate, readOnly = false }: CheckinWithReviewsCardProps) {
  const { id, userName, userPhotoUrl, date, title, evidencePhotoUrl, status, reviews, userId: checkinUserId, isReplacement, reviewClosesAt } = checkin;
  const navigation = useNavigation();

  const [userId, setUserId] = useState('');
  const [userReview, setUserReview] = useState<CheckinReview | undefined>();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await Memory.get('userId') || '';
      setUserId(storedUserId);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId) {
      setUserReview(undefined);
      return;
    }

    setUserReview(reviews.find(review => review.reviewerId === userId));
  }, [userId, reviews]);

  const checkinRepository = useMemo(() => createCheckinRepository(), []);

  const reviewAsValidated = async () => {
    const review: CheckinReview = {
      reviewerId: userId,
      status: 'Validated',
    };

    const checkinUpdated = await checkinRepository.saveReview(id, review);
    setUserReview(review);
    onUpdate(checkinUpdated);
  };

  const reviewAsRejected = async () => {
    const review: CheckinReview = {
      reviewerId: userId,
      status: 'Rejected',
    };

    const checkinUpdated = await checkinRepository.saveReview(id, review);
    setUserReview(review);
    onUpdate(checkinUpdated);
  };

  return (
    <View className="flex flex-col items-start justify-center w-full gap-2 pb-4 overflow-hidden bg-white shadow-md rounded-2xl">
      <EvidencePhoto uri={evidencePhotoUrl} />

      <View className="flex flex-row items-center justify-start w-full gap-1 px-4">
        <ProfilePhoto name={userName} photoUrl={userPhotoUrl} />
        <View className="flex flex-col items-start justify-center flex-1 px-4 py-2">
          <Text className="w-full text-base font-medium"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {userName}
          </Text>
          <Text style={{ color: getColor("gray-3") }} className="text-xs" numberOfLines={1}>
            {formatRelativeDateTime(date)}
          </Text>
        </View>
        {renderStatus(status)}
      </View>

      <Text className="px-6 text-md">{title}</Text>

      {userId && userId !== checkinUserId && !readOnly && (
        <View className="px-6 mt-3">
          <Button color="danger" type="outline" textSize="text-sm" className="h-10" action={() => setReportOpen(true)}>
            Denunciar
          </Button>
        </View>
      )}

      <Modal visible={reportOpen} transparent animationType="fade" onRequestClose={() => setReportOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 24 }}>
          <View className="gap-3 p-4 bg-white rounded-3xl">
            <Text style={{ color: getColor('black') }} className="text-lg font-bold">Denunciar check-in</Text>
            <TextInput
              value={reportReason}
              onChangeText={setReportReason}
              placeholder="Motivo"
              className="px-3 py-2 border border-gray-300 rounded-xl"
            />
            <Button action={async () => {
              const reason = reportReason.trim();
              if (!reason) {
                toastErrorMessage('Conta o motivo da denúncia');
                return;
              }

              try {
                await checkinRepository.report(id, userId, reason);
                toastSuccessMessage('Denúncia na mesa. O dono já fica sabendo');
                setReportOpen(false);
                setReportReason('');
              } catch {
                toastErrorMessage('A denúncia não entrou. Tenta de novo.');
              }
            }}>
              Enviar
            </Button>
            <Pressable onPress={() => setReportOpen(false)}>
              <Text style={{ color: getColor('gray-3') }} className="text-center">Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {!readOnly && canReplaceCheckIn(userId, checkinUserId, isReplacement, reviewClosesAt) && (
        <View className="gap-2 px-6 mt-3">
          {reviews.filter((review) => review.status === 'Rejected').length > Math.floor(reviews.length / 2) && (
            <Text style={{ color: getColor('dark-orange') }} className="text-sm">
              Este check-in está perdendo a votação. Vale trocar.
            </Text>
          )}
          <Button
            color={{ text: 'primary', border: 'primary', background: 'light-primary' }}
            textSize="text-sm"
            className="h-10 border-2"
            action={() => navigation.push(`/create-checkin?checkInId=${id}`)}
          >
            Trocar check-in
          </Button>
        </View>
      )}

      {(userId !== checkinUserId && (reviews.length > 0 || status === 'Pending'))
        && <View style={{ backgroundColor: getColor("gray-d"), width: "90%", height: 0.5 }} className="mx-auto mt-3 mb-1"></View>}

      {reviews.length > 0 && renderReviews(reviews)}

      {status === 'Pending' && userId !== checkinUserId && !readOnly && renderReviewSection(userReview, reviewAsValidated, reviewAsRejected)}
    </View>
  );
}

function renderStatus(status: CheckinStatus) {
  const defaultClasses = 'px-3 py-1 font-semibold rounded-full text-sm';

  if (status === 'Pending')
    return (
      <Text style={{ backgroundColor: getColor("light-warning"), color: getColor("dark-orange") }} className={`${defaultClasses}`}>
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

function renderReviewSection(
  userReview: CheckinReview | undefined,
  reviewAsValidated: () => Promise<void>,
  reviewAsRejected: () => Promise<void>,
) {
  if (userReview !== undefined) {
    const isValidated = userReview.status === 'Validated';
    return (
      <View className="flex flex-row items-center justify-center w-full gap-2 px-4 py-2">
        <Icon
          type="font-awesome-5"
          name={isValidated ? 'check-circle' : 'flag'}
          size={14}
          color={isValidated ? 'success' : 'danger'}
        />
        <Text
          style={{ color: getColor(isValidated ? 'success' : 'danger') }}
          className="font-bold"
        >
          {isValidated ? 'Você já validou este check-in' : 'Você já rejeitou este check-in'}
        </Text>
      </View>
    );
  }

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
