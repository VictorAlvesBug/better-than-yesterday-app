import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import BackButton from '../components/back-button';
import CheckinsWithReviewsList from '../components/checkins-with-reviews-list';
import Ranking from '../components/ranking';
import {
  formatInteger,
  formatMoney,
  formatMoneyCompact,
  formatPercent,
} from '../utils/numberUtils';

const statusBarHeight = Constants.statusBarHeight;

export default function PlanSettingsScreen() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<'Ranking' | 'Check-ins'>(
    'Ranking',
  );

  // ---- ANIMAÇÃO DAS ABAS ----
  const translateX = useRef(new Animated.Value(0)).current;
  const [tabsWidth, setTabsWidth] = useState(0);

  // metade da largura do container das tabs
  const tabWidth = tabsWidth / 2 || 0;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: currentTab === 'Ranking' ? 0 : tabWidth,
      useNativeDriver: true,
    }).start();
  }, [currentTab, tabWidth, translateX]);

  const handleTabsLayout = (e: LayoutChangeEvent) => {
    setTabsWidth(e.nativeEvent.layout.width);
  };
  // ----------------------------

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
            <BackButton />
            <Text className="flex-1 text-lg font-bold text-left text-white">
              Treino 5x na semana
            </Text>
            <Pressable
              className="flex items-center justify-center w-20 h-20"
              onPress={() => {}}
            >
              <Ionicons name="share-social-outline" size={24} color="#fff" />
            </Pressable>
          </View>

          <View className="flex flex-col items-start w-[90%] gap-2 p-4 mb-6 justify-evenly bg-[#ffffff16] rounded-lg">
            <Text className="font-thin text-white">Pool de Recompensas</Text>
            <Text className="mb-1 text-3xl font-bold text-white">
              {formatMoney(252)}
            </Text>
            <View className="flex flex-row items-center w-full justify-evenly">
              <View className="flex flex-col items-center justify-center gap-1">
                <Text className="text-xs font-thin text-white">
                  Total Multas
                </Text>
                <Text className="font-semibold text-white">
                  {formatMoneyCompact(280)}
                </Text>
              </View>
              <View className="flex flex-col items-center justify-center gap-1">
                <Text className="text-xs font-thin text-white">
                  Taxa Admin ({formatPercent(0.1)})
                </Text>
                <Text className="font-semibold text-white">
                  {formatMoneyCompact(28)}
                </Text>
              </View>
              <View className="flex flex-col items-center justify-center gap-1">
                <Text className="text-xs font-thin text-white">
                  Participantes
                </Text>
                <Text className="font-semibold text-white">
                  {formatInteger(8)}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View className="flex flex-col items-center justify-center gap-4 px-4 my-4">
          {/* CONTAINER DAS TABS + FUNDO ANIMADO */}
          <View
            className="flex flex-row items-center justify-center w-full overflow-hidden bg-white shadow-md rounded-2xl h-14"
            onLayout={handleTabsLayout}
          >
            {/* Pill animado de fundo */}
            {tabWidth > 0 && (
              <Animated.View
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: tabWidth,
                  transform: [{ translateX }],
                }}
              >
                <LinearGradient
                  colors={['#7c3aed', '#4f46e5']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={{
                    flex: 1,
                    margin: 4,
                    borderRadius: 12,
                  }}
                />
              </Animated.View>
            )}

            {/* Aba Ranking */}
            <Pressable
              className="flex-1 h-full"
              onPress={() => setCurrentTab('Ranking')}
            >
              <View className="items-center justify-center flex-1 mx-1 rounded-xl">
                <Text
                  className={`font-semibold text-lg ${
                    currentTab === 'Ranking' ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  Ranking
                </Text>
              </View>
            </Pressable>

            {/* Aba Check-ins */}
            <Pressable
              className="flex-1 h-full"
              onPress={() => setCurrentTab('Check-ins')}
            >
              <View className="items-center justify-center flex-1 mx-1 rounded-xl">
                <Text
                  className={`font-semibold text-lg ${
                    currentTab === 'Check-ins' ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  Check-ins
                </Text>
              </View>
            </Pressable>
          </View>

          {currentTab === 'Ranking' && <Ranking planId={'abc'} />}
          {currentTab === 'Check-ins' && (
            <CheckinsWithReviewsList planId={'abc'} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
