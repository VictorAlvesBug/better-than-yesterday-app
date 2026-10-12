import { getColor } from '@/types/color.type';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import Memory from '../api/memory';
import { AppNotification } from '../api/notificationRepository';
import Card from '../components/card';
import NotFoundState from '../components/not-found-state';
import ScreenHeader from '../components/screen-header';
import ScreenLayout from '../components/screen-layout';
import { useRepositories } from '../hooks/useRepositories';

export default function NotificationsScreen() {
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
          {items.map((item) => (
            <Card key={item.id} className="w-full">
              <Text style={{ color: getColor('black') }} className="text-base">
                {item.message}
              </Text>
            </Card>
          ))}
        </ScrollView>
      )}
    </ScreenLayout>
  );
}
