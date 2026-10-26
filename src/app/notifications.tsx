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

  const openPlan = async (planId: string) => {
    await Memory.set('planId', planId);
    navigation.push('/plan-tracker' as Href);
  };

  const openCheckIn = async (planId: string, checkInId?: string) => {
    await Memory.set('planId', planId);
    navigation.push((checkInId ? `/create-checkin?checkInId=${checkInId}` : '/create-checkin') as Href);
  };

  const actionFor = (item: AppNotification) => {
    const planId = item.payload?.planId || item.planId;
    const checkInId = notificationCheckInId(item.payload);
    const kind = item.payload?.type || item.kind;

    if (kind === 'CheckInRejectionRisk')
      return { label: 'Substituir', run: () => openCheckIn(planId, checkInId) };

    if (kind === 'RestAtRisk' || kind === 'FineAtRisk')
      return { label: 'Marcar', run: () => openCheckIn(planId) };

    if (kind === 'CheckInReviewed' || kind === 'CheckInMade' || kind === 'CheckInReported' || kind === 'PlanStartsToday')
      return { label: 'Ver', run: () => openPlan(planId) };

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
          title="Não foi possível carregar os avisos"
          description="Tente abrir esta tela novamente."
        />
      ) : items.length === 0 ? (
        <NotFoundState
          title="Nenhum aviso por enquanto"
          description="Quando algo importante acontecer no plano, o aviso aparece aqui."
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
