import { Checkin } from '@/types/checkin.type';
import { getColor } from '@/types/color.type';
import React from 'react';
import { Text, View } from 'react-native';
import CheckinWithReviewsCard from './checkin-with-reviews-card';

type CheckinsWithReviewsListProps = {
  planId: string;
};

export default function CheckinsWithReviewsList({
  planId,
}: CheckinsWithReviewsListProps) {
  // TODO: Consulta dos checkins com validação

  const checkins: Checkin[] = [];
  checkins.push({
    id: 'a',
    planId: '',
    userId: '',
    name: 'Victor Alves',
    date: '2026-03-14 15:20',
    title: 'Treininho top',
    photoUrl:
      'https://i0.wp.com/www.muscleandfitness.com/wp-content/uploads/2016/09/Bodybuilder-Working-Out-His-Upper-Body-With-Cable-Crossover-Exercise.jpg?quality=86&strip=all',
    status: 'Validated',
    reviews: [
      { status: 'Validated' },
      { status: 'Validated' },
      { status: 'Validated' },
      { status: 'Rejected' },
    ],
  });
  checkins.push({
    id: 'b',
    planId: '',
    userId: '',
    name: 'Maria de Fátima',
    date: '2026-03-14 15:20',
    title: 'Leitura do dia',
    photoUrl:
      'https://images.pexels.com/photos/6941666/pexels-photo-6941666.jpeg',
    status: 'Pending',
    reviews: [{ status: 'Validated' }],
  });
  checkins.push({
    id: 'c',
    planId: '',
    userId: '',
    name: 'Carla Silva',
    date: '2026-03-14 15:20',
    title: 'Sem foto hoje',
    photoUrl: '',
    status: 'Rejected',
    reviews: [
      { status: 'Rejected' },
      { status: 'Rejected' },
      { status: 'Rejected' },
      { status: 'Rejected' },
    ],
  });
  checkins.push({
    id: 'd',
    planId: '',
    userId: '',
    name: 'Carla Silva',
    date: '2026-03-14 15:20',
    title: 'Teste',
    photoUrl: '',
    status: 'Pending',
    reviews: []
  });

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
