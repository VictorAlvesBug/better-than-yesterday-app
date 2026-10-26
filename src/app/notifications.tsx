import { getColor } from '@/types/color.type';
import { notificationCheckInId } from '@/types/notification.type';
import { Href } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import Memory from '../api/memory';
import { AppNotification } from '../api/notificationRepository';
import { Button } from '../components/button';
import Card from '../components/card';
import NotFoundState from '../components/not-found-state';
import ScreenHeader from '../components/screen-header';
import ScreenLayout from '../components/screen-layout';
import useNavigation from '../hooks/useNavigation';
import { useRepositories } from '../hooks/useRepositories';
import { getDateTimeToFront } from '../utils/dateUtils';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { notification: notificationRepository } = useRepositories();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    const userId = await Memory.get('userId');
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const notifications = await notificationRepository.generate(userId);
      setItems(notifications);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [notificationRepository]);

  useEffect(() => {
    load();
  }, [load]);

  const openChallenge = async (challengeId: string) => {
    await Memory.set('challengeId', challengeId);
    navigation.push('/challenge-tracker' as Href);
  };

  const openCheckIn = async (challengeId: string, checkInId?: string) => {
    await Memory.set('challengeId', challengeId);
    navigation.push((checkInId ? `/create-checkin?checkInId=${checkInId}` : '/create-checkin') as Href);
  };

  const actionFor = (item: AppNotification) => {
    const challengeId = item.payload?.challengeId || item.challengeId;
    const checkInId = notificationCheckInId(item.payload);
    const kind = item.payload?.type || item.kind;

    if (kind === 'CheckInRejectionRisk')
      return { label: 'Trocar', run: () => openCheckIn(challengeId, checkInId) };

    if (kind === 'RestAtRisk' || kind === 'FineAtRisk')
      return { label: 'Jogar', run: () => openCheckIn(challengeId) };

    if (kind === 'CheckInReviewed' || kind === 'CheckInMade' || kind === 'CheckInReported' || kind === 'ChallengeStartsToday')
      return { label: 'Ver arena', run: () => openChallenge(challengeId) };

    return null;
  };

  return (
    <ScreenLayout header={<ScreenHeader title="Avisos" />}>
      {loading ? (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color={getColor('gray-6')} />
        </View>
      ) : failed ? (
        <NotFoundState
          title="Os avisos não entraram em campo"
          description="Abre essa tela de novo."
        />
      ) : items.length === 0 ? (
        <NotFoundState
          title="Silêncio na arena"
          description="Quando o desafio esquentar, o aviso aparece aqui."
        />
      ) : (
        <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ gap: 12 }}>
          {items.map((item) => {
            const action = actionFor(item);
            return (
              <Card key={item.id} className="w-full gap-2">
                <Text style={{ color: getColor('gray-6') }} className="text-xs">
                  {getDateTimeToFront(new Date(item.createdAt))}
                </Text>
                <Text style={{ color: getColor('black') }} className="text-base">
                  {item.message}
                </Text>
                {action && (
                  <Button action={action.run} type="outline" className="h-10">
                    {action.label}
                  </Button>
                )}
              </Card>
            );
          })}
        </ScrollView>
      )}
    </ScreenLayout>
  );
}
