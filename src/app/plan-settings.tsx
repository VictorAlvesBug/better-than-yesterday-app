import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Card from '../components/card';

const statusBarHeight = Constants.statusBarHeight;

export default function PlanSettingsScreen() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('Ranking');

  return (
    <View
      className="relative flex-1 bg-slate-200"
      style={{ marginTop: statusBarHeight }}
    >
      <ScrollView
        style={{ flex: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }} // Espaço pro botão
      >
        <LinearGradient
          colors={['#7c3aed', '#4f46e5']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ flex: 1 }}
          className="flex flex-col items-center justify-center w-full"
        >
          <View className="flex flex-row items-center justify-center">
            <Pressable
              className="flex items-center justify-center w-10 h-10 p-10"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back-outline" size={24} color="#fff" />
            </Pressable>
            <Text className="flex-1 text-lg font-bold text-white">
              Treino 5x na semana (alinhar a esquerda)
            </Text>
            <Pressable
              className="flex items-center justify-center w-10 h-10 p-10"
              onPress={() => router.push('/plan-settings')}
            >
              <Ionicons name="share-social-outline" size={24} color="#fff" />
            </Pressable>
          </View>

          <View className="flex flex-col items-start w-[90%] gap-2 p-4 mb-6 justify-evenly bg-[#ffffff16] rounded-lg">
            <Text className="font-thin text-white">Pool de Recompensas</Text>
            <Text className="mb-1 text-3xl font-bold text-white">
              R$ 252,00
            </Text>
            <View className="flex flex-row items-center w-full justify-evenly">
              <View className="flex flex-col items-center justify-center gap-1">
                <Text className="text-xs font-thin text-white">
                  Total Multas
                </Text>
                <Text className="font-semibold text-white">R$ 280</Text>
              </View>
              <View className="flex flex-col items-center justify-center gap-1">
                <Text className="text-xs font-thin text-white">
                  Taxa Admin (10%)
                </Text>
                <Text className="font-semibold text-white">R$ 28</Text>
              </View>
              <View className="flex flex-col items-center justify-center gap-1">
                <Text className="text-xs font-thin text-white">
                  Participantes
                </Text>
                <Text className="font-semibold text-white">8</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View className="flex flex-col items-center justify-center gap-4 px-4 my-4">
          <View className="flex flex-row items-center justify-center w-full bg-white shadow-md rounded-2xl h-14">
            <Pressable
              className={`h-full flex-1 overflow-hidden`}
              onPress={() => setCurrentTab('Ranking')}
            >
              <LinearGradient
                colors={
                  currentTab === 'Ranking'
                    ? ['#7c3aed', '#4f46e5']
                    : ['transparent', 'transparent']
                }
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                className="items-center justify-center flex-1 m-1 rounded-xl"
              >
                <Text
                  className={`font-semibold text-lg ${currentTab === 'Ranking' ? 'text-white' : 'text-gray-500'}`}
                >
                  Ranking
                </Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              className={`h-full flex-1 overflow-hidden`}
              onPress={() => setCurrentTab('Check-in')}
            >
              <LinearGradient
                colors={
                  currentTab === 'Check-in'
                    ? ['#7c3aed', '#4f46e5']
                    : ['transparent', 'transparent']
                }
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                className="items-center justify-center flex-1 m-1 rounded-xl"
              >
                <Text
                  className={`font-semibold text-lg ${currentTab === 'Check-in' ? 'text-white' : 'text-gray-500'}`}
                >
                  Check-in
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          <Card className="flex flex-col items-start justify-center flex-1 w-full gap-3">
            <Text>Content</Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
