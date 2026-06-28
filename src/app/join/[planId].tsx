import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import JoinPlanModal from '../../components/join-plan-modal';

export default function JoinPlanScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    if (router.canGoBack())
      router.back();
    else
      router.replace('/manage-plans');
  };

  return (
    <View className="flex-1">
      <JoinPlanModal
        visible={visible}
        onClose={handleClose}
        initialPlanId={typeof planId === 'string' ? planId : undefined}
      />
    </View>
  );
}
