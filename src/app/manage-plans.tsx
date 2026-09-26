import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from '../components/button';
import JoinPlanModal from '../components/join-plan-modal';
import ScreenHeader from '../components/screen-header';
import ScreenLayout from '../components/screen-layout';
import SideDrawer, { SideDrawerOpenButton } from '../components/side-drawer';
import useNavigation from '../hooks/useNavigation';

export default function ManagePlansScreen() {
  const navigation = useNavigation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  return (
    <View className="flex-1">
      <ScreenLayout
        header={
          <ScreenHeader
            title="Gerenciar Planos"
            left={<SideDrawerOpenButton setIsDrawerOpen={setIsDrawerOpen} />}
          />
        }
      >
        <JoinPlanModal
          visible={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="w-full px-4 gap-3 py-3">
            <Button action={() => navigation.push('/create-plan')}>Criar Novo Plano</Button>
            <Button action={() => setIsJoinModalOpen(true)}>Tenho um Link de Convidado</Button>
            <Button action={() => navigation.push('/public-plans')}>Planos Populares</Button>
          </View>
        </ScrollView>
      </ScreenLayout>
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </View>
  );
}
