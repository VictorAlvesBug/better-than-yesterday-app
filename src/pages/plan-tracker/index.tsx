import { Header } from '@/src/components/header';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

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

type Checkin = {
  id: string;
  planId: string;
  userId: string;
  date: string;
  title: string;
  description: string;
};

export function PlanTrackerPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planParticipants, setPlanParticipants] = useState<PlanParticipant[]>(
    [],
  );
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

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
  const readingCheckins = useMemo(() => {
    return checkins
      .filter((c) => c.planId === READING_PLAN_ID)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5); // últimos 5
  }, [checkins]);

  const sequenceLabel = '12 dias sem falhar'; // placeholder: depois você calcula baseado em checkins

  if (loading) {
    return (
      <View
        className="flex-1 bg-slate-200 justify-center items-center"
        style={{ marginTop: statusBarHeight }}
      >
        <ActivityIndicator size="large" color="#0f766e" />
        <Text className="mt-2 text-sm text-slate-600">Carregando plano...</Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-slate-200"
      style={{ marginTop: statusBarHeight }}
    >
      {/* Header */}
      <Header />

      {/* Conteúdo rolável */}
      <ScrollView
        style={{ flex: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }} // Espaço pro botão
      >
        <View className="px-4 pt-2 pb-8">
          {/* Card principal: Nome do plano / hábito */}
          <View className="relative w-full bg-white rounded-lg p-4 mb-4">
            {/* Badge (nome do hábito) */}
            <Text className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
              {habit?.name ?? 'Hábito'}
            </Text>

            {/* Título (Descrição do plano) */}
            <Text className="text-xl font-black text-gray-800 mb-4">
              {plan?.description ?? 'Plano de hábito'}
            </Text>

            {/* Imagem (ainda estática) */}
            <Image
              source={{ uri: 'https://picsum.photos/200/300' }}
              className="w-full h-40 bg-gray-200 rounded-lg mb-4"
            />

            {/* Sequência de dias sem falhar */}
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-sm text-gray-600">Sequência atual</Text>
              <Text className="text-lg font-bold text-emerald-600">
                {sequenceLabel}
              </Text>
            </View>

            {/* Ranking atual - usando participantes ativos */}
            <View className="mt-3 border-t border-slate-200 pt-3">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Ranking atual
              </Text>
              <View className="gap-2">
                {readingParticipants.length === 0 && (
                  <Text className="text-xs text-gray-500">
                    Nenhum participante ativo ainda.
                  </Text>
                )}

                {readingParticipants.map((participant, index) => (
                  <View
                    key={participant.id}
                    className="flex-row items-center justify-between"
                  >
                    <Text className="text-sm text-gray-700">
                      {index + 1}º {participant.nickname}
                    </Text>
                    <Text className="text-xs text-emerald-600 font-semibold">
                      {/* Aqui você pode depois exibir dias/faltas reais */}
                      participante ativo
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Lista dos últimos check-ins dos participantes */}
          <View className="w-full bg-white rounded-lg p-4 mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              Últimos check-ins
            </Text>

            <View className="gap-2">
              {readingCheckins.length === 0 && (
                <Text className="text-xs text-gray-500">
                  Nenhum check-in registrado ainda.
                </Text>
              )}

              {readingCheckins.map((checkin) => {
                const user = users.find((u) => u.id === checkin.userId);
                return (
                  <View
                    key={checkin.id}
                    className="flex-row items-center justify-between"
                  >
                    <View className="flex-1 pr-2">
                      <Text className="text-sm font-medium text-gray-800">
                        {user?.nickname ?? 'Participante'}
                      </Text>
                      <Text className="text-xs text-gray-500" numberOfLines={1}>
                        {checkin.date} • {checkin.title}
                      </Text>
                    </View>
                    <Text className="text-xs text-emerald-600 font-semibold">
                      ✔ Check-in
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Ações principais do plano */}
          <View className="w-full bg-white rounded-lg p-4 gap-3 mb-4">
            {/* Botão para adicionar check-in */}
            <Pressable className="w-full bg-emerald-600 py-3 rounded-lg items-center justify-center active:opacity-80">
              <Text className="text-sm font-semibold text-white">
                Adicionar check-in de hoje
              </Text>
            </Pressable>

            {/* Botão para usar uma folga */}
            <Pressable className="w-full bg-amber-500 py-3 rounded-lg items-center justify-center active:opacity-80">
              <Text className="text-sm font-semibold text-white">
                Usar uma folga disponível
              </Text>
              <Text className="text-[11px] text-amber-100 mt-1">
                Você tem 2 folgas acumuladas
              </Text>
            </Pressable>

            {/* Botão para pagar multa */}
            <Pressable className="w-full bg-red-500 py-3 rounded-lg items-center justify-center active:opacity-80">
              <Text className="text-sm font-semibold text-white">
                Pagar multa
              </Text>
              <Text className="text-[11px] text-red-100 mt-1">
                Gerar PIX individual deste plano ou consolidado de todos
              </Text>
            </Pressable>

            {/* Botão para abandonar plano */}
            <Pressable className="w-full border border-red-400 py-3 rounded-lg items-center justify-center active:opacity-80">
              <Text className="text-sm font-semibold text-red-600">
                Abandonar plano
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Botão flutuante fixo (atalho para novo check-in, por exemplo) */}
      <Pressable className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-xl active:opacity-80">
        <Feather name="plus" size={24} color="white" />
      </Pressable>
    </View>
  );
}
