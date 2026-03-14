import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import CheckinsWithReviewsList from '../components/checkins-with-reviews-list';
import Ranking from '../components/ranking';

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
          colors={['#8f10ed', '#5038f6']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          className="flex flex-col items-center justify-center w-full"
        >
          <View className="flex flex-row items-center justify-center w-full">
            <Pressable
              className="flex items-center justify-center w-20 h-20"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back-outline" size={24} color="#fff" />
            </Pressable>
            <Text className="flex-1 text-lg font-bold text-left text-white">
              Treino 5x na semana
            </Text>
            <Pressable
              className="flex items-center justify-center w-20 h-20"
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
                style={{
                  flex: 1,
                  margin: 4,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
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
              onPress={() => setCurrentTab('Check-ins')}
            >
              <LinearGradient
                colors={
                  currentTab === 'Check-ins'
                    ? ['#7c3aed', '#4f46e5']
                    : ['transparent', 'transparent']
                }
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{
                  flex: 1,
                  margin: 4,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Text
                  className={`font-semibold text-lg ${currentTab === 'Check-ins' ? 'text-white' : 'text-gray-500'}`}
                >
                  Check-ins
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          { currentTab === 'Ranking' && <Ranking /> }
          { currentTab === 'Check-ins' && <CheckinsWithReviewsList planId={'abc'} /> }
        </View>
      </ScrollView>
    </View>
  );
}
