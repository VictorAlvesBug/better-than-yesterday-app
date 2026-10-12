import React from 'react';
import { View } from 'react-native';
import NotFoundState from '../components/not-found-state';
import { useAuth } from '../context/auth';
import useNavigation from '../hooks/useNavigation';

export default function NotFoundScreen() {
  const { signOut } = useAuth();
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-white">
      <NotFoundState
        title="Page not found"
        description="The screen you’re trying to open does not exist."
        primaryLabel="Go to Home"
        onPrimary={signOut}
        secondaryLabel="Go back"
        onSecondary={() => navigation.back()}
      />
    </View>
  );
}
