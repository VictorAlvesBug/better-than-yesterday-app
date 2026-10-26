import { getColor } from '@/types/color.type';
import { ChallengeEnriched } from '@/types/challenge.type';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import createChallengeRepository from '../api/challengeRepository';
import Ranking from '../components/ranking';
import ScreenHeader from '../components/screen-header';
import ScreenLayout from '../components/screen-layout';

export default function ChallengePeekScreen() {
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const challengeRepository = useMemo(() => createChallengeRepository(), []);
  const [challenge, setChallenge] = useState<ChallengeEnriched | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!challengeId) {
        setLoading(false);
        return;
      }

      const dbChallenge = await challengeRepository.getById(challengeId);
      setChallenge(dbChallenge);
      setLoading(false);
    };

    fetchChallenge();
  }, [challengeId, challengeRepository]);

  if (loading) {
    return (
      <View className="items-center justify-center flex-1" style={{ backgroundColor: getColor('gray-e') }}>
        <ActivityIndicator size="large" color={getColor('gray-6')} />
      </View>
    );
  }

  return (
    <ScreenLayout
      header={
        <ScreenHeader
          title={challenge?.description ?? challenge?.habitName ?? 'Desafio'}
          titleSize="text-lg"
          className="pb-6"
        >
          <Text style={{ color: getColor('white') }} className="px-4 mt-2 text-sm">
            Visualização do ranking (somente leitura)
          </Text>
        </ScreenHeader>
      }
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-4 mt-4">
          {challengeId && <Ranking challengeId={challengeId} />}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
