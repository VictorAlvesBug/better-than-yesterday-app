import { getColor } from '@/types/color.type';
import Constants from 'expo-constants';
import React from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import BackButton from '../components/back-button';
import Card from '../components/card';
import GradientView from '../components/gradient-view';

export default function AboutScreen() {
  return (
    <View className="flex-1" style={{ backgroundColor: getColor('gray-e') }}>
      <GradientView style={{ paddingTop: Constants.statusBarHeight }} className="flex flex-row items-center w-full">
        <BackButton />
        <Text className="text-xl font-bold text-white">Sobre nós</Text>
      </GradientView>
      <ScrollView className="flex-1 px-4 py-4">
        <Card className="flex flex-col gap-4">
          <Text style={{ color: getColor('black') }} className="text-2xl font-bold">
            Better Than Yesterday
          </Text>
          <Text style={{ color: getColor('gray-7') }} className="text-base leading-6">
            O Better Than Yesterday ajuda você e seus amigos a manter hábitos consistentes
            com accountability em grupo, check-ins com foto e ranking por plano.
          </Text>
          <Text style={{ color: getColor('gray-7') }} className="text-sm">
            Versão {Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
          <Text
            style={{ color: getColor('violet') }}
            className="text-sm underline"
            onPress={() => Linking.openURL('mailto:suporte@betterthanyesterday.app')}
          >
            suporte@betterthanyesterday.app
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}
