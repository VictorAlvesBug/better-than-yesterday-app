import Memory from '@/src/api/memory';
import { getColor } from '@/types/color.type';
import { ChallengeEnriched } from '@/types/challenge.type';
import Constants from 'expo-constants';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import ChallengeTrackerContent from '../components/challenge-tracker-content';
import useNavigation from '../hooks/useNavigation';
import { useRepositories } from '../hooks/useRepositories';

const statusBarHeight = Constants.statusBarHeight;

export default function ChallengeTrackerScreen() {
  const { challenge: challengeRepository } = useRepositories();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [challenge, setChallenge] = useState<ChallengeEnriched | null>(null);

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading)
      setLoading(true);

    try {
      const challengeId = await Memory.get('challengeId');

      if (!challengeId) {
        navigation.replace('/manage-challenges');
        return;
      }

      const dbChallenge = await challengeRepository.getById(challengeId);

      if (!dbChallenge) {
        await Memory.remove('challengeId');
        navigation.replace('/manage-challenges');
        return;
      }

      setChallenge(dbChallenge);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [challengeRepository, navigation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    fetchData(false);
  }, [fetchData]);

  if (loading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ marginTop: statusBarHeight, backgroundColor: getColor('gray-e') }}
      >
        <ActivityIndicator size="large" color={getColor('gray-6')} />
        <Text style={{ color: getColor('gray-6') }} className="mt-2 text-sm">Abrindo a arena...</Text>
      </View>
    );
  }

  if (!challenge)
    return null;

  return (
    <ChallengeTrackerContent
      challenge={challenge}
      refreshing={refreshing}
      onRefresh={onRefresh}
      refreshKey={refreshKey}
    />
  );
}
