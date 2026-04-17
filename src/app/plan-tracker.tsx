import Memory from '@/src/api/memory';
import createPlanRepository from '@/src/api/planRepository';
import Card from '@/src/components/card';
import { CheckinEnriched } from '@/types/checkin.type';
import { getColor } from '@/types/color.type';
import { Habit } from '@/types/habit.type';
import { PlanEnriched, PlanMember } from '@/types/plan.type';
import { User } from '@/types/user.type';
import Constants from 'expo-constants';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import createCheckinRepository from '../api/checkinRepository';
import CheckinCard from '../components/checkin-card';
import DaysOffCard from '../components/days-off-card';
import GradientView from '../components/gradient-view';
import Icon from '../components/icon';
import SideDrawer, { SideDrawerOpenButton } from '../components/side-drawer';
import useNavigation from '../hooks/useNavigation';
import { getDifferenceInDays } from '../utils/dateUtils';
import { formatInteger, formatPercentCompact } from '../utils/numberUtils';

const statusBarHeight = Constants.statusBarHeight;

// IDs fixos para o plano de leitura (poderia vir via rota/params)
const READING_PLAN_ID = '65352d6fb37d421799f9f5fb17a42c04';

export default function PlanTrackerScreen() {
  const planRepository = createPlanRepository();
  const checkinRepository = createCheckinRepository();

  const [plan, setPlan] = useState<PlanEnriched | null>(null);

  const [users,] = useState<User[]>([]);
  const [habits,] = useState<Habit[]>([]);
  const [planMembers,] = useState<PlanMember[]>(
    [],
  );
  const [checkins, setCheckins] = useState<CheckinEnriched[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigation = useNavigation();

  const habit = useMemo(
    () => habits.find((h) => h.id === plan?.habitId),
    [habits, plan],
  );

  const readingMembers = useMemo(() => {
    return planMembers
      .filter((member) => member.planId === READING_PLAN_ID && member.status === 'active')
      .map((member) => {
        const user = users.find((u) => u.id === member.userId);
        return {
          id: member.id,
          userId: member.userId,
          nickname: user?.nickname ?? 'Membro',
          status: member.status,
        };
      });
  }, [planMembers, users]);

  useEffect(() => {
    const fetchData = async () => {
      const planId = await Memory.get('planId');

      if(plan && plan.id === planId) {
        setLoading(false);
        return;
      }

      if (!planId) {
        navigation.replace('/manage-plans');
        return;
      }
      
      const dbPlan = await planRepository.getById(planId);

      if (!dbPlan) {
        await Memory.remove('planId');
        navigation.replace('/manage-plans');
        return;
      }

      setPlan(dbPlan);

      const checkins = await checkinRepository.list();
      setCheckins(checkins);

      setLoading(false);
    };

    fetchData();
  }, [planRepository, checkinRepository, navigation]);

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

  if (!plan)
    return null;

  const planInfoMock = {
    planId: '123',
    userId: '456',
    streak: 7,
    position: 3,
    checkinCount: 13,
    totalCheckinCount: 21,
    daysSinceStart: getDifferenceInDays(new Date(), plan.startsAt),
    totalDays: getDifferenceInDays(plan.startsAt, plan.endsAt),
    daysOffAvailable: 1,
    ...plan
  };

  return (
    <View
      className="relative flex-1"
      style={{ backgroundColor: getColor("gray-e") }}
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
        <GradientView
          style={{
            paddingTop: Constants.statusBarHeight,
          }}
          className="flex flex-col items-center justify-center w-full"
        >
          <View className="flex flex-row items-center justify-between w-full">
            <SideDrawerOpenButton setIsDrawerOpen={setIsDrawerOpen} />

            <View className="flex flex-col items-center justify-center">
              <Text style={{ color: getColor("white") }} className="text-xl font-bold text-center ">
                BTY
              </Text>
            </View>

            <Pressable
              className="flex items-center justify-center w-20 h-20"
              onPress={() => navigation.push('/plan-settings')}
            >
              <Icon name="people" size={24} color={"white"} />
            </Pressable>
          </View>
          <View className="flex flex-col items-start w-full gap-2 px-4 py-1 mb-8 justify-evenly">
            <Text style={{ color: getColor("white") }} className="text-2xl font-bold ">
              {planInfoMock.description ?? planInfoMock.habitName}
            </Text>
            <Text style={{ color: getColor("white") }} className=" text-md">
              {`${(7 - planInfoMock.daysOffPerWeek)}x por semana`}
            </Text>
          </View>
        </GradientView>

        <View className="flex flex-col items-start justify-center gap-5 px-4 -mt-6">
          <View className="flex flex-row items-center justify-between flex-1 w-full gap-4">
            <Card className="flex flex-col items-start justify-center flex-1 w-full gap-1">
              <View className="flex flex-row items-center justify-start gap-3">
                <Icon type="font-awesome-5" name="fire" size={16} color={"warning"} />
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
                <Icon type="font-awesome-5" name="award" size={16} color={"violet"} />
                <Text style={{ color: getColor("gray-7") }} className="">Posição</Text>
              </View>
              <Text style={{ color: getColor("black") }} className="text-3xl font-bold">
                #{formatInteger(planInfoMock.position)}
              </Text>
              <Text style={{ color: getColor("gray-7") }} className="text-xs font-semibold ">
                de {planInfoMock.memberCount/*formatInteger(planInfoMock.memberCount)*/} pessoas
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
              <GradientView
                style={{
                  flex: 1,
                  height: '100%',
                  borderRadius: 9999,
                  width: `${(100 * planInfoMock.daysSinceStart) /
                    planInfoMock.totalDays
                    }%`,
                }}
              />
            </View>
            <View className="flex flex-row items-center justify-between w-full gap-2">
              <Icon name="calendar-clear-outline" size={16} />
              <Text style={{ color: getColor("gray-7") }} className="flex-1 ">
                {`Termina em ${formatInteger(planInfoMock.totalDays - planInfoMock.daysSinceStart)} ${planInfoMock.totalDays - planInfoMock.daysSinceStart === 1 ? 'dia' : 'dias'
                  }`}
              </Text>
              <Text style={{ color: getColor("violet") }} className="font-semibold">
                {formatPercentCompact(
                  planInfoMock.daysSinceStart / planInfoMock.totalDays,
                )}
              </Text>
            </View>
          </Card>
          <DaysOffCard daysOffAvailable={planInfoMock.daysOffAvailable} onUseDayOff={() => { }} />
          {/* Lista dos últimos check-ins dos membros */}
          <View className="mt-2 -mb-5">
            <Text style={{ color: getColor("black") }} className="mb-3 text-lg font-extrabold">
              Check-ins Recentes
            </Text>
            {checkins.length === 0 && (
              <Text style={{ color: getColor("gray-7") }} className="text-xs ">
                Faça seu primeiro check-in hoje para aparecer aqui!
              </Text>
            )}
          </View>

          {checkins.map((checkin) => {
            return <CheckinCard key={checkin.id} {...checkin} />;
          })}
        </View>
      </ScrollView>

      {/* Botão flutuante fixo */}
      <Pressable style={{ backgroundColor: getColor('violet') }} className="absolute items-center justify-center w-16 h-16 overflow-hidden rounded-full shadow-xl bottom-4 right-4 active:opacity-80">
        <GradientView
          className="flex flex-col items-center justify-center w-full h-full"
        >
          <Icon name="camera" size={24} color={"white"} />
        </GradientView>
      </Pressable>
    </View>
  );
}
