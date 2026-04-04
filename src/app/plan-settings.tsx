import { getColor } from '@/types/color.type';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
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
import GradientView from '../components/gradient-view';
import Ranking from '../components/ranking';
import {
  formatInteger,
  formatMoney,
  formatMoneyCompact,
  formatPercent,
} from '../utils/numberUtils';

const statusBarHeight = Constants.statusBarHeight;

export default function PlanSettingsScreen() {
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
      className="relative flex-1"
      style={{ marginTop: statusBarHeight, backgroundColor: getColor("gray-e") }}
    >
      <ScrollView
        style={{ flex: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }} // Espaço pro botão
      >
        <GradientView
          className="flex flex-col items-center justify-center w-full"
        >
          <View className="flex flex-row items-center justify-center w-full">
            <BackButton />
            <Text style={{color: getColor("white")}} className="flex-1 text-lg font-bold text-left">
              Treino 5x na semana
            </Text>
            <Pressable
              className="flex items-center justify-center w-20 h-20"
              onPress={() => { }}
            >
              <Ionicons name="share-social-outline" size={24} color="#fff" />
            </Pressable>
          </View>

          <View style={{backgroundColor: getColor("opaque")}} className="flex flex-col items-start w-[90%] gap-2 p-4 mb-6 justify-evenly rounded-lg">
            <Text style={{color: getColor("white")}} className="font-thin">Pool de Recompensas</Text>
            <Text style={{color: getColor("white")}} className="mb-1 text-3xl font-bold">
              {formatMoney(252)}
            </Text>
            <View className="flex flex-row items-center w-full justify-evenly">
              <View className="flex flex-col items-center justify-center gap-1">
                <Text style={{color: getColor("white")}} className="text-xs font-thin">
                  Total Multas
                </Text>
                <Text style={{color: getColor("white")}} className="font-semibold">
                  {formatMoneyCompact(280)}
                </Text>
              </View>
              <View className="flex flex-col items-center justify-center gap-1">
                <Text style={{color: getColor("white")}} className="text-xs font-thin">
                  Taxa Admin ({formatPercent(0.1)})
                </Text>
                <Text style={{color: getColor("white")}} className="font-semibold">
                  {formatMoneyCompact(28)}
                </Text>
              </View>
              <View className="flex flex-col items-center justify-center gap-1">
                <Text style={{color: getColor("white")}} className="text-xs font-thin">
                  Participantes
                </Text>
                <Text style={{color: getColor("white")}} className="font-semibold">
                  {formatInteger(8)}
                </Text>
              </View>
            </View>
          </View>
        </GradientView>

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
                <GradientView 
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
                  style={{color: getColor(currentTab === 'Ranking' ? "white" : "gray-7")}} className={`font-semibold text-lg`}
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
                  style={{color: getColor(currentTab === 'Check-ins' ? "white" : "gray-7")}} className={`font-semibold block text-lg`}
                >
                  Check-ins
                </Text>
              </View>
            </Pressable>
          </View>

          <View
            className={`flex flex-col items-center justify-center gap-4 w-full ${currentTab === 'Ranking' ? 'block' : 'hidden'}`}
          >
            <Ranking planId={'abc'} />
          </View>
          <View
            className={`flex flex-col items-center justify-center gap-4  w-full ${currentTab === 'Check-ins' ? 'block' : 'hidden'}`}
          >
            <CheckinsWithReviewsList planId={'abc'} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
