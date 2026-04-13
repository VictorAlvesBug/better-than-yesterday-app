import createHabitRepository from '@/src/api/habitRepository';
import Memory from '@/src/api/memory';
import createPlanRepository from '@/src/api/planRepository';
import Card from '@/src/components/card';
import { getColor } from '@/types/color.type';
import { Habit } from '@/types/habit.type';
import { CreatePlan, parsePenaltyValue, PenaltyOption, penaltyValueOptions, PlanType } from '@/types/plan.type';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Switch,
  Text,
  View
} from 'react-native';
import AmountSelect from '../components/amount-select';
import BackButton from '../components/back-button';
import { Button } from '../components/button';
import DateRangeSelect from '../components/date-range-select';
import GradientView from '../components/gradient-view';
import Input from '../components/input';
import KeyboardableView from '../components/keyboardable-view';
import Label from '../components/label';
import RadioButtonSelect, { RadioButtonOption } from '../components/radio-button-select';
import SearchableSelect from '../components/searchable-select';
import { formatDateRelativeToToday, formatDateToFront, getDateOnly, getDateOnlyWithOffset, getDateTime, getDateToFrontWithOffset } from '../utils/dateUtils';
import { formatMoney } from '../utils/numberUtils';
import { generateId } from '../utils/stringUtils';

export default function CreatePlanScreen() {
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  const [plan, setPlan] = useState<CreatePlan>({
    ownerId: '',
    habitId: '',
    startsAt: getDateOnlyWithOffset(+1),
    endsAt: getDateOnlyWithOffset(+365),
    daysOffPerWeek: daysPerWeek,
    penaltyValue: 10,
    type: 'private',
    createdAt: getDateTime()
  });

  const [joinAfterCreated, setJoinAfterCreated] = useState(false);

  const toughnessMap = {
    0: 'Insano',
    1: 'Muito difícil',
    2: 'Difícil',
    3: 'Mediana',
    4: 'Mediana',
    5: 'Fácil',
    6: 'Muito fácil',
  }

  type HabitWithJustAdded = Habit & { justAdded?: boolean };

  const [habitList, setHabitList] = useState<HabitWithJustAdded[]>([]);

  const habitRepository = createHabitRepository();
  const planRepository = createPlanRepository();

  const penaltyOptions = penaltyValueOptions.map((penaltyValue): PenaltyOption => ({
    id: penaltyValue.toString(),
    label: formatMoney(penaltyValue)
  }));

  function createHabit(habitName: string) {
    const justAddedHabit = { id: generateId(), name: habitName, justAdded: true };
    setHabitList((prev) => [...prev, justAddedHabit])
    return justAddedHabit;
  }

  const radioButtonOptions: RadioButtonOption[] = [{
    value: 'private',
    icon: { name: 'lock-closed-outline', size: 20 },
    title: 'Privado',
    complement: 'Apenas para amigos e família'
  },
  {
    value: 'public',
    icon: { name: 'globe-outline', size: 20 },
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
      id: habit.id,
      name: habit.name,
    });

    plan.ownerId = await Memory.get('userId') || '';


    plan.daysOffPerWeek = 7 - daysPerWeek;

    const planSaved = await planRepository.save(plan);

    console.log('Plano criado com sucesso:', planSaved);

    if (joinAfterCreated) {
      await planRepository.join(planSaved.id, plan.ownerId);
      await Memory.set('planId', planSaved.id);
      router.push('/plan-tracker');
      return;
    }

    router.back();
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
              startValue={formatDateToFront(plan.startsAt)}
              setStartValue={startsAt => setPlan(prev => ({ ...prev, startsAt: getDateOnly(startsAt) }))}
              formatStartDescription={formatDateRelativeToToday}
              minValue={getDateToFrontWithOffset(+1)}
              endValueLabel="Data de Término"
              endValue={formatDateToFront(plan.endsAt)}
              setEndValue={endsAt => setPlan(prev => ({ ...prev, endsAt: getDateOnly(endsAt) }))}
              formatEndDescription={formatDateRelativeToToday}
            />
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Quantas vezes por semana?</Label>
            <AmountSelect
              value={daysPerWeek}
              setValue={value => setDaysPerWeek(value)}
              minValue={1}
              maxValue={7}
              selectedIcon={{
                type: 'octicons',
                name: 'check-circle-fill',
                color: 'violet'
              }}
              nonSelectedIcon={{
                type: 'font-awesome-6',
                name: 'umbrella-beach'
              }}
              className='w-full'
            />
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Multa por Descumprimento</Label>
            <SearchableSelect<PenaltyOption>
              label="Selecione o Valor"
              value={plan.penaltyValue.toString()}
              options={penaltyOptions}
              formatOptionLabel={penaltyValue => penaltyValue.label}
              onChange={selectedPenaltyValue => {
                setPlan(prev => ({ ...prev, penaltyValue: parsePenaltyValue(selectedPenaltyValue.id) }));
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

          <Card className="flex flex-row items-center justify-between w-full gap-1">
            <Label>Participar do Plano</Label>
            <Switch
              value={joinAfterCreated}
              onValueChange={checked => setJoinAfterCreated(checked)}
              trackColor={{ true: getColor('light-purple'), false: getColor('gray-9') }}
              thumbColor={getColor(joinAfterCreated ? 'light-violet' : 'gray-d')}
              ios_backgroundColor="#767577"
            />
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