import { CheckinEnriched } from '@/types/checkin.type';
import { getColor } from '@/types/color.type';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import createCheckinRepository from '../api/checkinRepository';
import CheckinWithReviewsCard from './checkin-with-reviews-card';

type CheckinsWithReviewsListProps = {
  planId: string;
};

export default function CheckinsWithReviewsList({
  planId,
}: CheckinsWithReviewsListProps) {
  // TODO: Consulta dos checkins com validação

  const checkinRepository = createCheckinRepository();

  const [checkins, setCheckins] = React.useState<CheckinEnriched[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setCheckins(await checkinRepository.list());
    };

    fetchData();
  }, [checkinRepository]);

  return (
    <View className="flex flex-col w-full gap-4">
      {checkins.length === 0 && (
        <Text style={{color: getColor("gray-4")}} className="text-base">Nenhum Check-in aqui...</Text>
      )}
      {checkins.map((checkin) => (
        <CheckinWithReviewsCard key={checkin.id} {...checkin} />
      ))}
    </View>
  );
}
