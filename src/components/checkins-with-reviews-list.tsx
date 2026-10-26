import { CheckinEnriched } from '@/types/checkin.type';
import { getColor } from '@/types/color.type';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useRepositories } from '../hooks/useRepositories';
import CheckinWithReviewsCard from './checkin-with-reviews-card';

type CheckinsWithReviewsListProps = {
  challengeId: string;
  refreshKey?: number;
};

export default function CheckinsWithReviewsList({
  challengeId,
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
      if (!challengeId)
        return;

      const data = await checkinRepository.list({ challengeId });
      setCheckins(data.sort((a, b) => b.date.localeCompare(a.date)));
    };

    fetchData();
  }, [checkinRepository, challengeId, refreshKey]);

  return (
    <View className="flex flex-col w-full gap-4">
      {checkins.length === 0 && (
        <Text style={{ color: getColor('gray-4') }} className="text-base">Nenhum check-in nessa rodada...</Text>
      )}
      {checkins.map((checkin) => (
        <CheckinWithReviewsCard key={checkin.id} checkin={checkin} onUpdate={handleUpdateCheckIn} />
      ))}
    </View>
  );
}
