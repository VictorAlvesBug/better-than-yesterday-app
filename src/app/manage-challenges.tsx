import { Href } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from '../components/button';
import JoinChallengeModal from '../components/join-challenge-modal';
import ScreenHeader from '../components/screen-header';
import ScreenLayout from '../components/screen-layout';
import SideDrawer, { SideDrawerOpenButton } from '../components/side-drawer';
import useNavigation from '../hooks/useNavigation';

export default function ManageChallengesScreen() {
  const navigation = useNavigation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  return (
    <View className="flex-1">
      <ScreenLayout
        header={
          <ScreenHeader
            title="Arena"
            left={<SideDrawerOpenButton setIsDrawerOpen={setIsDrawerOpen} />}
          />
        }
      >
        <JoinChallengeModal
          visible={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="w-full px-4 gap-3 py-3">
            <Button action={() => navigation.push('/create-challenge')}>Criar desafio</Button>
            <Button action={() => setIsJoinModalOpen(true)}>Tenho um convite</Button>
            <Button action={() => navigation.push('/public-challenges')}>Desafios em alta</Button>
            <Button action={() => navigation.push('/my-challenges' as Href)} type="outline">Meus desafios</Button>
          </View>
        </ScrollView>
      </ScreenLayout>
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </View>
  );
}
