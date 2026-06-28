import { CheckinEnriched } from '@/types/checkin.type';
import { getColor } from '@/types/color.type';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useRepositories } from '../hooks/useRepositories';
import CheckinWithReviewsCard from './checkin-with-reviews-card';

type CheckinsWithReviewsListProps = {
  planId: string;
  refreshKey?: number;
};

export default function CheckinsWithReviewsList({
  planId,
  refreshKey = 0,
}: CheckinsWithReviewsListProps) {
  const { checkin: checkinRepository } = useRepositories();
  const [checkins, setCheckins] = React.useState<CheckinEnriched[]>([]);

  function handleUpdateCheckIn(updatedCheckIn: CheckinEnriched) {
    setCheckins(currentCheckins =>
      currentCheckins.map(checkin =>
        checkin.id === updatedCheckIn.id ? updatedCheckIn : checkin
      )
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!planId)
        return;

      const data = await checkinRepository.list({ planId });
      setCheckins(data.sort((a, b) => b.date.localeCompare(a.date)));
    };

    fetchData();
  }, [checkinRepository, planId, refreshKey]);

  return (
    <View className="flex flex-col w-full gap-4">
      {checkins.length === 0 && (
        <Text style={{ color: getColor('gray-4') }} className="text-base">Nenhum Check-in aqui...</Text>
      )}
      {checkins.map((checkin) => (
        <CheckinWithReviewsCard key={checkin.id} checkin={checkin} onUpdate={handleUpdateCheckIn} />
      ))}
    </View>
  );
}
