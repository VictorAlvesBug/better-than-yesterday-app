import Card from '@/src/components/card';
import { getColor } from '@/types/color.type';
import { Habit } from '@/types/habit.type';
import { CreatePlan, DaysOffPerWeek, PlanType } from '@/types/plan.type';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Text,
  View
} from 'react-native';
import BackButton from '../components/back-button';
import { Button } from '../components/button';
import DateRangeSelect from '../components/date-range-select';
import GradientView from '../components/gradient-view';
import Input from '../components/input';
import KeyboardableView from '../components/keyboardable-view';
import Label from '../components/label';
import NumberSelect from '../components/number-select';
import RadioButtonSelect, { RadioButtonOption } from '../components/radio-button-select';
import SearchableSelect from '../components/searchable-select';
import { formatDateRelativeToToday, getDateOnly, getDateOnlyWithOffset, getDateTime, getDateToFront, getDateToFrontWithOffset } from '../utils/dateUtils';
import { formatMoney } from '../utils/numberUtils';
import createHabitRepository from './api/repositories/habitRepository';
import Memory from './api/repositories/memory';
import createPlanRepository from './api/repositories/planRepository';

export default function CreatePlanScreen() {
  const [plan, setPlan] = useState<CreatePlan>({
    habitId: '',
    startsAt: getDateOnlyWithOffset(+1),
    endsAt: getDateOnlyWithOffset(+365),
    daysOffPerWeek: 2,
    penaltyValue: 10,
    type: 'private',
    createdAt: getDateTime(new Date()),
  });

  const toughnessMap = {
    0: 'Quase impossível',
    1: 'Muito difícil',
    2: 'Difícil',
    3: 'Média',
    4: 'Média',
    5: 'Fácil',
    6: 'Muito fácil',
  }

  type HabitWithJustAdded = Habit & { justAdded?: boolean };

  const [habitList, setHabitList] = useState<HabitWithJustAdded[]>([]);

  const habitRepository = createHabitRepository();
  const planRepository = createPlanRepository();

  const auxList2 = [1, 5, 10, 20, 50, 100];

  type PenaltyValue = {
    id: string;
    label: string;
  }

  const penaltyValueList = auxList2.map(item => ({
    id: item.toString(), label: formatMoney(item)
  }));

  function createHabit(habitName: string) {
    const justAddedHabit = { id: habitName, name: habitName, justAdded: true };
    setHabitList((prev) => [...prev, justAddedHabit])
    return justAddedHabit;
  }

  const radioButtonOptions: RadioButtonOption[] = [{
    value: 'private',
    icon: 'lock-closed-outline',
    title: 'Privado',
    complement: 'Apenas para amigos e família'
  },
  {
    value: 'public',
    icon: 'globe-outline',
    title: 'Público',
    complement: 'Qualquer pessoa pode participar'
  }]

  useEffect(() => {
    const fetchHabits = async () => {
      const habits = await habitRepository.listAll();

      setHabitList(habits);
    };

    fetchHabits();
  }, [habitRepository, setHabitList]);

  const createPlan = async () => {
    const habit = habitList.find(h => h.id === plan.habitId);

    if (!habit) {
      console.log('Selecione um hábito para criar o plano.');
      return;
    }

    habit.justAdded && await habitRepository.save({
      name: habit.name,
    });

    const planSaved = await planRepository.save(plan);

    await Memory.set('planId', planSaved.id);
    router.push('/plan-tracker');
    console.log('Plano criado com sucesso:', planSaved);

    await planRepository.join(planSaved.id, await Memory.get('userId') || '');
  };

  return (
    <>
      <GradientView 
        style={{
          paddingTop: Constants.statusBarHeight,
        }}
        className="flex flex-row items-center justify-start w-full">
        <BackButton />
        <Text className="text-xl font-bold text-center text-white">
          Criar Plano
        </Text>
      </GradientView>
      <KeyboardableView>
        <View
          className="flex-1 w-full gap-6 px-4 py-3"
          style={{ backgroundColor: getColor("gray-e") }}
        >
          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Hábitos</Label>
            <SearchableSelect<Habit>
              label="Selecione o Hábito"
              placeholder="Escolha um hábito..."
              value={plan.habitId}
              formatOptionLabel={habit => habit.name}
              options={habitList}
              onChange={selectedHabit => {
                setPlan({ ...plan, habitId: selectedHabit.id });
                setHabitList(prev => prev.filter(item => !item.justAdded || (item.justAdded && item.id === selectedHabit.id)))
              }}
              createOption={createHabit}
            />
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Descrição (opcional)</Label>
            <Input
              placeholder="Ex: Treinar ao menos 45 minutos..."
              value={plan.description}
              onChange={(value) => setPlan({ ...plan, description: value })}
            />
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Período do Plano</Label>
            <DateRangeSelect
              startValueLabel="Data de Início"
              startValue={getDateToFront(plan.startsAt)}
              setStartValue={startsAt => setPlan(prev => ({ ...prev, startsAt: getDateOnly(startsAt) }))}
              formatStartDescription={formatDateRelativeToToday}
              minValue={getDateToFrontWithOffset(+1)}
              endValueLabel="Data de Término"
              endValue={getDateToFront(plan.endsAt)}
              setEndValue={endsAt => setPlan(prev => ({ ...prev, endsAt: getDateOnly(endsAt) }))}
              formatEndDescription={formatDateRelativeToToday}
            />
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Folgas Permitidas por Semana</Label>
              <NumberSelect
              value={plan.daysOffPerWeek}
              setValue={daysOffPerWeek => setPlan(prev => ({ ...prev, daysOffPerWeek: daysOffPerWeek as DaysOffPerWeek }))}
              minValue={0}
              maxValue={6}
              className='flex-1'
            />
            <View className='flex flex-row items-center justify-start mt-2'>
            <Text className='text-sm'>Dificuldade: </Text>
            <Text className='text-sm font-bold'>{toughnessMap[plan.daysOffPerWeek]}</Text>
            </View>
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Multa por Descumprimento</Label>
            <SearchableSelect<PenaltyValue>
              label="Selecione o Valor"
              value={plan.penaltyValue.toString()}
              options={penaltyValueList}
              formatOptionLabel={penaltyValue => penaltyValue.label}
              onChange={selectedPenaltyValue => {
                setPlan(prev => ({ ...prev, penaltyValue: Number.parseInt(selectedPenaltyValue.id) }));
              }}
            />
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Tipo de Plano</Label>
            <RadioButtonSelect
              selectedValue={plan.type}
              onChange={value => setPlan(prev => ({ ...prev, type: value as PlanType }))}
              options={radioButtonOptions} />
          </Card>

          <Button className='p-0 overflow-hidden' action={createPlan}>
            <GradientView className="flex flex-col items-center justify-center w-full h-full">
              <Text style={{ color: getColor('white') }} className='text-lg font-bold'>Criar Plano</Text>
            </GradientView>
          </Button>
        </View>
      </KeyboardableView>
    </>
  );
}