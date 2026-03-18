import Card from '@/src/components/card';
import { Checkin } from '@/types/checkin.type';
import { FontAwesome, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
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

  /*useEffect(() => {
    async function loadData() {
      try {
        const [usersRes, habitsRes, plansRes, participantsRes, checkinsRes] =
          await Promise.all([
            fetch(`${API_BASE_URL}/users`),
            fetch(`${API_BASE_URL}/habits`),
            fetch(`${API_BASE_URL}/plans`),
            fetch(`${API_BASE_URL}/planParticipants`),
            fetch(`${API_BASE_URL}/checkins`),
          ]);

        const [
          usersJson,
          habitsJson,
          plansJson,
          participantsJson,
          checkinsJson,
        ] = await Promise.all([
          usersRes.json(),
          habitsRes.json(),
          plansRes.json(),
          participantsRes.json(),
          checkinsRes.json(),
        ]);

        setUsers(usersJson);
        setHabits(habitsJson);
        setPlans(plansJson);
        setPlanParticipants(participantsJson);
        setCheckins(checkinsJson);
      } catch (error) {
        console.error('Erro ao buscar dados do json-server', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);*/

  const plan = useMemo(
    () => plans.find((p) => p.id === READING_PLAN_ID),
    [plans],
  );

  const habit = useMemo(
    () => habits.find((h) => h.id === plan?.habitId),
    [habits, plan],
  );

  // participantes do plano de leitura
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

  // checkins do plano de leitura, mais recentes primeiro
  /*const readingCheckins = useMemo(() => {
    return checkins
      .filter((c) => c.planId === READING_PLAN_ID)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5); // últimos 5
  }, [checkins]);*/

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
        className="items-center justify-center flex-1 bg-slate-200"
        style={{ marginTop: statusBarHeight }}
      >
        <ActivityIndicator size="large" color="#0f766e" />
        <Text className="mt-2 text-sm text-slate-600">Carregando plano...</Text>
      </View>
    );
  }

  console.log(statusBarHeight);

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
      className="relative flex-1 bg-slate-200"
      style={{ marginTop: statusBarHeight }}
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
          colors={['#8f10ed', '#5038f6']}
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
              <FontAwesome name="bars" size={20} color="white" />
            </Pressable>

            <View className="flex flex-col items-center justify-center">
              <Text className="text-xl font-bold text-center text-white">
                BTY
              </Text>
            </View>

            <Pressable
              className="flex items-center justify-center w-20 h-20"
              onPress={() => router.push('/plan-settings')}
            >
              <FontAwesome6 name="user-group" size={20} color="#fff" />
            </Pressable>
          </View>
          <View className="flex flex-col items-start w-full gap-2 px-4 py-1 mb-8 justify-evenly">
            <Text className="text-2xl font-bold text-white">
              {habit?.name ?? 'Treino 5x na semana'}
            </Text>
            <Text className="text-white text-md">
              {habit?.name ?? '5x por semana'}
            </Text>
          </View>
        </LinearGradient>

        <View className="flex flex-col items-start justify-center gap-6 px-4 -mt-4">
          <View className="flex flex-row items-center justify-between flex-1 w-full gap-4 mb-6">
            <Card className="flex flex-col items-start justify-center flex-1 w-full gap-1">
              <View className="flex flex-row items-center justify-start gap-2">
                <FontAwesome5 name="fire" size={18} color="#e48d0a" />
                <Text className="text-gray-500">Sequência</Text>
              </View>
              <Text className="text-3xl font-bold text-black">
                {formatInteger(planInfoMock.streak)}
              </Text>
              <Text className="text-xs font-semibold text-gray-500">
                dias seguidos
              </Text>
            </Card>
            <Card className="flex flex-col items-start justify-center flex-1 w-full gap-1">
              <View className="flex flex-row items-center justify-start gap-2">
                <FontAwesome5 name="award" size={18} color="#7d23ce" />
                <Text className="text-gray-500">Posição</Text>
              </View>
              <Text className="text-3xl font-bold text-black">
                #{formatInteger(planInfoMock.position)}
              </Text>
              <Text className="text-xs font-semibold text-gray-500">
                de {formatInteger(planInfoMock.totalParticipants)} pessoas
              </Text>
            </Card>
          </View>

          <Card className="flex flex-col items-start justify-center flex-1 w-full gap-3">
            <View className="flex flex-row items-center justify-between w-full">
              <Text className="font-bold text-black text-md">Progresso</Text>
              <Text className="font-bold text-purple-700 text-md">
                {formatInteger(planInfoMock.checkinCount)}/
                {formatInteger(planInfoMock.totalCheckinCount)} dias
              </Text>
            </View>
            <View className="w-full h-3 bg-gray-200 rounded-full">
              <LinearGradient
                colors={['#7c3aed', '#4f46e5']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                  flex: 1,
                  height: '100%',
                  borderRadius: '9999px',
                  width: `${(100 * planInfoMock.checkinCount) / planInfoMock.totalCheckinCount}%`,
                }}
              ></LinearGradient>
            </View>
            <View className="flex flex-row items-center justify-between w-full gap-2">
              <FontAwesome5 name="calendar" size={16} color="#6b7280" />
              <Text className="flex-1 text-gray-500">
                {`Termina em ${formatInteger(planInfoMock.daysToFinish)} ${planInfoMock.daysToFinish === 1 ? 'dia' : 'dias'}`}
              </Text>
              <Text className="font-semibold text-purple-700">
                {formatPercentCompact(
                  planInfoMock.checkinCount / planInfoMock.totalCheckinCount,
                )}
              </Text>
            </View>
          </Card>

          <View className="flex flex-row items-center justify-center flex-1 w-full gap-4 px-4 border border-green-300 shadow-md bg-green-50 rounded-xl">
            <FontAwesome6 name="gift" size={20} color="#03a540" />
            <View className="flex flex-col items-start justify-center flex-1">
              <Text className="text-lg font-semibold text-[#03a540]">
                {formatInteger(planInfoMock.restCount)} folgas disponíveis
              </Text>
              <Text className="text-[#03a540]">Use com sabedoria!</Text>
            </View>
            <Pressable className="bg-[#03a540] rounded-lg px-4 py-2">
              <Text className="font-semibold text-white">Usar</Text>
            </Pressable>
          </View>

          {/* Lista dos últimos check-ins dos participantes */}
          <View className="mt-2 -mb-5">
            <Text className="mb-3 text-lg font-bold text-gray-700 fond-bold">
              Check-ins Recentes
            </Text>
            {readingCheckins.length === 0 && (
              <Text className="text-xs text-gray-500">
                Faça seu primeiro check-in hoje para aparecer aqui!
              </Text>
            )}
          </View>

          {readingCheckins.map((checkin) => {
            // const user = users.find((u) => u.id === checkin.userId);
            return <CheckinCard key={checkin.id} {...checkin} />;
          })}
        </View>
      </ScrollView>

      {/* Botão flutuante fixo (atalho para novo check-in, por exemplo) */}
      <Pressable className="absolute items-center justify-center w-16 h-16 bg-purple-700 rounded-full shadow-xl bottom-4 right-4 active:opacity-80">
        <FontAwesome6 name="camera" size={24} color="white" />
      </Pressable>
    </View>
  );
}
