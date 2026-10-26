import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import JoinChallengeModal from '../../components/join-challenge-modal';

export default function JoinChallengeScreen() {
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    if (router.canGoBack())
      router.back();
    else
      router.replace('/manage-challenges');
  };

  return (
    <View className="flex-1">
      <JoinChallengeModal
        visible={visible}
        onClose={handleClose}
        initialChallengeId={typeof challengeId === 'string' ? challengeId : undefined}
      />
    </View>
  );
}
