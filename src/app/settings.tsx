import Memory from '@/src/api/memory';
import createUserRepository from '@/src/api/userRepository';
import { getColor } from '@/types/color.type';
import { User } from '@/types/user.type';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import BackButton from '../components/back-button';
import { Button } from '../components/button';
import Card from '../components/card';
import GradientView from '../components/gradient-view';
import Label from '../components/label';
import useNavigation from '../hooks/useNavigation';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const userRepository = createUserRepository();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = await Memory.get('userId') || '';
      if (!userId) {
        navigation.replace('/login');
        return;
      }

      const dbUser = await userRepository.getById(userId);
      setUser(dbUser);
      setLoading(false);
    };

    fetchUser();
  }, [navigation, userRepository]);

  if (loading) {
    return (
      <View className="items-center justify-center flex-1" style={{ backgroundColor: getColor('gray-e') }}>
        <ActivityIndicator size="large" color={getColor('gray-6')} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: getColor('gray-e') }}>
      <GradientView style={{ paddingTop: Constants.statusBarHeight }} className="flex flex-row items-center w-full">
        <BackButton />
        <Text className="text-xl font-bold text-white">Configurações</Text>
      </GradientView>
      <ScrollView className="flex-1 px-4 py-4">
        <Card className="flex flex-col gap-3 mb-4">
          <View>
            <Label>Apelido</Label>
            <Text style={{ color: getColor('black') }} className="text-base">{user?.nickname}</Text>
          </View>
          <View>
            <Label>E-mail</Label>
            <Text style={{ color: getColor('black') }} className="text-base">{user?.email}</Text>
          </View>
          <View>
            <Label>Versão do app</Label>
            <Text style={{ color: getColor('black') }} className="text-base">{Constants.expoConfig?.version ?? '1.0.0'}</Text>
          </View>
        </Card>
        <Button action={() => navigation.push('/manage-plans')}>Gerenciar Planos</Button>
      </ScrollView>
    </View>
  );
}
