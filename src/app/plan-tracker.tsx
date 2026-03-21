import Card from '@/src/components/card';
import { Checkin } from '@/types/checkin.type';
import { getColor } from '@/types/color.type';
import { FontAwesome5, FontAwesome6, Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/button';
import CheckinCard from '../components/checkin-card';
import SideDrawer from '../components/side-drawer';
import { formatInteger, formatPercentCompact } from '../utils/numberUtils';

const statusBarHeight = Constants.statusBarHeight;

// ajuste aqui para o IP/porta do seu json-server
const API_BASE_URL = 'http://localhost:3000';

// IDs fixos para o plano de leitura (poderia vir via rota/params)
const READING_PLAN_ID = '65352d6fb37d421799f9f5fb17a42c04';

type User = {
  id: string;
  nickname: string;
  email: string;
  createdAt: string;
};

type Habit = {
  id: string;
  name: string;
  createdAt: string;
};

type Plan = {
  id: string;
  habitId: string;
  description: string;
  startsAt: string;
  endsAt: string;
  status: 'active' | 'inactive';
  type: 'public' | 'private';
  restsPerWeek: number;
  createdAt: string;
};

type PlanParticipant = {
  id: string;
  planId: string;
  userId: string;
  joinedAt: string;
  status: 'active' | 'blocked';
};

export default function PlanTrackerScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planParticipants, setPlanParticipants] = useState<PlanParticipant[]>(
    [],
  );
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const router = useRouter();

  const plan = useMemo(
    () => plans.find((p) => p.id === READING_PLAN_ID),
    [plans],
  );

  const habit = useMemo(
    () => habits.find((h) => h.id === plan?.habitId),
    [habits, plan],
  );

  const readingParticipants = useMemo(() => {
    return planParticipants
      .filter((pp) => pp.planId === READING_PLAN_ID && pp.status === 'active')
      .map((pp) => {
        const user = users.find((u) => u.id === pp.userId);
        return {
          id: pp.id,
          userId: pp.userId,
          nickname: user?.nickname ?? 'Participante',
          status: pp.status,
        };
      });
  }, [planParticipants, users]);

  const readingCheckins: Checkin[] = [];
  readingCheckins.push({
    id: 'checkin1',
    planId: '',
    userId: '',
    name: 'John Doe',
    date: '2026-03-14 09:15',
    title: 'Test',
    photoUrl:
      'https://images.pexels.com/photos/6941666/pexels-photo-6941666.jpeg',
    reviews: [],
    status: 'Validated',
  });
  readingCheckins.push({
    id: 'checkin2',
    planId: '',
    userId: '',
    name: 'Victor Bug',
    date: '2026-03-13 07:20',
    title: 'Hoje foi em jejum!',
    photoUrl:
      'https://i0.wp.com/www.muscleandfitness.com/wp-content/uploads/2016/09/Bodybuilder-Working-Out-His-Upper-Body-With-Cable-Crossover-Exercise.jpg?quality=86&strip=all',
    reviews: [],
    status: 'Validated',
  });
  readingCheckins.push({
    id: 'checkin3',
    planId: '',
    userId: '',
    name: 'Teste',
    date: '2026-02-11 12:10',
    title: 'Lorem ipsum dolor sit amet!',
    photoUrl:
      'https://www.auraleisure.ie/wp-content/uploads/2023/03/john-arano-h4i9G-de7Po-unsplash-1-scaled.jpg',
    reviews: [],
    status: 'Validated',
  });
  readingCheckins.push({
    id: 'checkin4',
    planId: '',
    userId: '',
    name: 'Teste da Silva',
    date: '2026-03-08 12:10',
    title: 'Lorem ipsu44m dolor sit amet! 😋🔥',
    photoUrl: '',
    reviews: [],
    status: 'Validated',
  });

  if (loading) {
    return (
      <View
        className="items-center justify-center flex-1"
        style={{ marginTop: statusBarHeight, backgroundColor: getColor("gray-e") }}
      >
        <ActivityIndicator size="large" color={getColor("gray-6")} />
        <Text style={{ color: getColor("gray-6") }} className="mt-2 text-sm">Carregando plano...</Text>
      </View>
    );
  }

  const planInfoMock = {
    streak: 7,
    position: 3,
    totalParticipants: 8,
    checkinCount: 13,
    totalCheckinCount: 21,
    daysToFinish: 23,
    restCount: 2,
  };

  return (
    <View
      className="relative flex-1"
      style={{ marginTop: statusBarHeight, backgroundColor: getColor("gray-e") }}
    >
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      <ScrollView
        style={{ flex: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }} // Espaço pro botão
      >
        <LinearGradient
          colors={[getColor("violet"), getColor("purple")]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          className="flex flex-col items-center justify-center w-full"
        >
          <View className="flex flex-row items-center justify-between w-full">
            <Pressable
              className="flex items-center justify-center w-20 h-20"
              onPress={() => setIsDrawerOpen(true)}
              hitSlop={10}
            >
              <Ionicons name="menu" size={24} color={getColor("white")} />
            </Pressable>

            <View className="flex flex-col items-center justify-center">
              <Text style={{color: getColor("white")}} className="text-xl font-bold text-center ">
                BTY
              </Text>
            </View>

            <Pressable
              className="flex items-center justify-center w-20 h-20"
              onPress={() => router.push('/plan-settings')}
            >
              <Ionicons name="people-outline" size={24} color={getColor("white")} />
            </Pressable>
          </View>
          <View className="flex flex-col items-start w-full gap-2 px-4 py-1 mb-8 justify-evenly">
            <Text style={{color: getColor("white")}} className="text-2xl font-bold ">
              {habit?.name ?? 'Treino 5x na semana'}
            </Text>
            <Text style={{color: getColor("white")}} className=" text-md">
              {habit?.name ?? '5x por semana'}
            </Text>
          </View>
        </LinearGradient>

        <View className="flex flex-col items-start justify-center gap-5 px-4 -mt-6">
          <View className="flex flex-row items-center justify-between flex-1 w-full gap-4">
            <Card className="flex flex-col items-start justify-center flex-1 w-full gap-1">
              <View className="flex flex-row items-center justify-start gap-3">
                <FontAwesome5 name="fire" size={16} color={getColor("warning")} />
                <Text style={{ color: getColor("gray-7") }} className="">Sequência</Text>
              </View>
              <Text style={{ color: getColor("black") }} className="text-3xl font-bold">
                {formatInteger(planInfoMock.streak)}
              </Text>
              <Text style={{ color: getColor("gray-7") }} className="text-xs font-semibold ">
                dias seguidos
              </Text>
            </Card>
            <Card className="flex flex-col items-start justify-center flex-1 w-full gap-1">
              <View className="flex flex-row items-center justify-start gap-3">
                <FontAwesome5 name="award" size={16} color={getColor("violet")} />
                <Text style={{ color: getColor("gray-7") }} className="">Posição</Text>
              </View>
              <Text style={{ color: getColor("black") }} className="text-3xl font-bold">
                #{formatInteger(planInfoMock.position)}
              </Text>
              <Text style={{ color: getColor("gray-7") }} className="text-xs font-semibold ">
                de {formatInteger(planInfoMock.totalParticipants)} pessoas
              </Text>
            </Card>
          </View>

          <Card className="flex flex-col items-start justify-center flex-1 w-full gap-3">
            <View className="flex flex-row items-center justify-between w-full">
              <Text style={{ color: getColor("black") }} className="font-bold text-md">Progresso</Text>
              <Text style={{ color: getColor("violet") }} className="font-bold text-md">
                {formatInteger(planInfoMock.checkinCount)}/
                {formatInteger(planInfoMock.totalCheckinCount)} dias
              </Text>
            </View>
            <View style={{ backgroundColor: getColor("gray-e"), borderRadius: 9999, height: 10, width: "100%" }}>
              <LinearGradient
                colors={[getColor("violet"), getColor("purple")]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                  flex: 1,
                  height: '100%',
                  borderRadius: 9999,
                  width: `${(100 * planInfoMock.checkinCount) /
                    planInfoMock.totalCheckinCount
                    }%`,
                }}
              />
            </View>
            <View className="flex flex-row items-center justify-between w-full gap-2">
              <FontAwesome5 name="calendar" size={16} color={getColor("gray-7")} />
              <Text style={{ color: getColor("gray-7") }} className="flex-1 ">
                {`Termina em ${formatInteger(planInfoMock.daysToFinish)} ${planInfoMock.daysToFinish === 1 ? 'dia' : 'dias'
                  }`}
              </Text>
              <Text style={{ color: getColor("violet") }} className="font-semibold">
                {formatPercentCompact(
                  planInfoMock.checkinCount / planInfoMock.totalCheckinCount,
                )}
              </Text>
            </View>
          </Card>

          <View style={{ backgroundColor: getColor("light-success"), borderColor: getColor("success") }} className="flex flex-row items-center justify-center flex-1 w-full gap-4 px-4 py-2 border shadow-md rounded-xl">
            <FontAwesome6 name="gift" size={20} color={getColor("success")} />
            <View className="flex flex-col items-start justify-center flex-1">
              <Text style={{ color: getColor("success") }} className="text-base font-semibold">
                {formatInteger(planInfoMock.restCount)} folgas disponíveis
              </Text>
              <Text style={{ color: getColor("success") }} className="text-sm">Use com sabedoria!</Text>
            </View>
            <Button color="success" textSize='text-base' className="h-auto px-4 py-2 rounded-xl">Usar</Button>
          </View>

          {/* Lista dos últimos check-ins dos participantes */}
          <View className="mt-2 -mb-5">
            <Text style={{ color: getColor("black") }} className="mb-3 text-lg font-extrabold">
              Check-ins Recentes
            </Text>
            {readingCheckins.length === 0 && (
              <Text style={{ color: getColor("gray-7") }} className="text-xs ">
                Faça seu primeiro check-in hoje para aparecer aqui!
              </Text>
            )}
          </View>

          {readingCheckins.map((checkin) => {
            return <CheckinCard key={checkin.id} {...checkin} />;
          })}
        </View>
      </ScrollView>

      {/* Botão flutuante fixo */}
      <Pressable style={{ backgroundColor: getColor('violet') }} className="absolute items-center justify-center w-16 h-16 overflow-hidden rounded-full shadow-xl bottom-4 right-4 active:opacity-80">
        <LinearGradient
          colors={[getColor("violet"), getColor("purple")]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          className="flex flex-col items-center justify-center w-full h-full"
        >
          <FontAwesome6 name="camera" size={24} color={getColor("white")} />
        </LinearGradient>
      </Pressable>
    </View>
  );
}
