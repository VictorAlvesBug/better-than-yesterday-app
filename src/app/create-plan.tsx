import Card from '@/src/components/card';
import { getColor } from '@/types/color.type';
import { CreatePlan, DaysOffPerWeek, PlanType } from '@/types/plan.type';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Text,
  View
} from 'react-native';
import BackButton from '../components/back-button';
import { Button } from '../components/button';
import DateRangeSelect from '../components/date-range-select';
import GradientHeader from '../components/gradient-header';
import Input from '../components/input';
import KeyboardableView from '../components/keyboardable-view';
import Label from '../components/label';
import NumberSelect from '../components/number-select';
import RadioButtonSelect, { RadioButtonOption } from '../components/radio-button-select';
import SearchableSelect, { type Option } from '../components/searchable-select';
import { formatDate, getRelativeDate } from '../utils/dateUtils';
import { formatMoney } from '../utils/numberUtils';
import createHabitRepository from './api/repositories/habitRepository';
import Memory from './api/repositories/memory';
import createPlanRepository from './api/repositories/planRepository';

export default function CreatePlanScreen() {
  const [plan, setPlan] = useState<CreatePlan>({
    habitId: '',
    startsAt: formatDate(getRelativeDate(+1)),
    endsAt: formatDate(getRelativeDate(+365)),
    daysOffPerWeek: 2,
    penaltyValue: 10,
    type: 'private',
    createdAt: formatDate(new Date()),
  });

  const [habitList, setHabitList] = useState<Option[]>([]);

  const habitRepository = createHabitRepository();
  const planRepository = createPlanRepository();

  const auxList2 = [1, 5, 10, 20, 50, 100];

  const [penaltyValueList,] = useState<Option[]>(auxList2.map(item => ({
    value: item.toString(), label: formatMoney(item)
  })));

  function createHabit(name: string) {
    const newHabit = {
      value: name,
      label: name
    }
    setHabitList((prev) => [...prev, { ...newHabit, justAdded: true }])
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

      setHabitList(habits.map(habit => ({
        value: habit.id,
        label: habit.name
      })));
    };

    fetchHabits();
  }, [habitRepository, setHabitList]);

  const createPlan = async () => {
    const habit = habitList.find(h => h.value === plan.habitId);

    if (!habit) {
      console.log('Selecione um hábito para criar o plano.');
      return;
    }

    habit.justAdded && await habitRepository.save({
      name: habit.label,
    });

    const planSaved = await planRepository.save(plan);

    await Memory.set('planId', planSaved.id);
    router.push('/plan-tracker');
    console.log('Plano criado com sucesso:', planSaved);

    await planRepository.join(planSaved.id, await Memory.get('userId') || '');
  };

  return (
    <>
      <GradientHeader>
        <BackButton />
        <Text className="text-xl font-bold text-center text-white">
          Criar Plano
        </Text>
      </GradientHeader>
      <KeyboardableView>
        <View
          className="flex-1 w-full gap-6 px-4 py-3"
          style={{ backgroundColor: getColor("gray-e") }}
        >
          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Hábitos</Label>
            <SearchableSelect
              label="Selecione o Hábito"
              placeholder="Escolha um hábito..."
              value={plan.habitId}
              options={habitList}
              onChange={(newSelectedId) => {
                setPlan({ ...plan, habitId: newSelectedId });
                setHabitList(prev => prev.filter(item => !item.justAdded || (item.justAdded && item.value === newSelectedId)))
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
              startValue={plan.startsAt}
              setStartValue={startsAt => setPlan(prev => ({ ...prev, startsAt: startsAt }))}
              minValue={formatDate(getRelativeDate(+1))}
              finishValueLabel="Data de Término"
              finishValue={plan.endsAt}
              setFinishValue={endsAt => setPlan(prev => ({ ...prev, endsAt: endsAt }))}
            />
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Folgas Permitidas por Semana</Label>
            <NumberSelect
              value={plan.daysOffPerWeek}
              setValue={daysOffPerWeek => setPlan(prev => ({ ...prev, daysOffPerWeek: daysOffPerWeek as DaysOffPerWeek }))}
              minValue={0}
              maxValue={6}
            />
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Multa por Descumprimento</Label>
            <SearchableSelect
              label="Selecione o Valor"
              value={plan.penaltyValue.toString()}
              options={penaltyValueList}
              onChange={(newSelectedId) => {
                setPlan(prev => ({ ...prev, penaltyValue: Number.parseInt(newSelectedId) }));
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
            <LinearGradient
              colors={[getColor("violet"), getColor("purple-violet"), getColor("purple")]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              className="flex flex-col items-center justify-center w-full h-full">
              <Text style={{ color: getColor('white') }} className='text-lg font-bold'>Criar Plano</Text>
            </LinearGradient>
          </Button>
        </View>
      </KeyboardableView>
    </>
  );
}