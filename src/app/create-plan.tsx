import Card from '@/src/components/card';
import { getColor } from '@/types/color.type';
import { PlanType } from '@/types/plan.type';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View
} from 'react-native';
import BackButton from '../components/back-button';
import { Button } from '../components/button';
import DateRangeSelect from '../components/date-range-select';
import Input from '../components/input';
import Label from '../components/label';
import NumberSelect from '../components/number-select';
import RadioButtonSelect, { RadioButtonOption } from '../components/radio-button-select';
import SearchableSelect, { type Option } from '../components/searchable-select';
import { formatDate, getRelativeDate } from '../utils/dateUtils';
import { formatMoney } from '../utils/numberUtils';
import createHabitRepository from './api/repositories/habitRepository';

const statusBarHeight = Constants.statusBarHeight;

export default function CreatePlanScreen() {
  const [habitId, setHabitId] = useState<string | null>()
  const [description, setDescription] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(formatDate(getRelativeDate(+1)));
  const [finishDate, setFinishDate] = useState<string>(formatDate(getRelativeDate(+365)));
  const [daysOffPerWeek, setDaysOffPerWeek] = useState<number>(2);
  const [penaltyValue, setPenaltyValue] = useState<number>(10);

  const [habitList, setHabitList] = useState<Option[]>([]);

  const habitRepository = createHabitRepository();

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

  const [planType, setPlanType] = useState<PlanType>('private');

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

  return (
    <View
      className="flex-1"
      style={{ marginTop: statusBarHeight, backgroundColor: getColor("gray-e") }}
    >
      <ScrollView
        style={{ flex: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }} // Espaço pro botão
      >
        <LinearGradient
          colors={[getColor("violet"), getColor("purple-violet"), getColor("purple")]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          className="flex flex-col items-center justify-center w-full"
        >
          <View className="flex flex-row items-center justify-start w-full">
            <BackButton />

            <View className="flex flex-col items-center justify-center">
              <Text className="text-xl font-bold text-center text-white">
                Criar Plano
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="w-full gap-6 px-4 py-3">
          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Hábito</Label>
            <SearchableSelect
              label="Selecione o Hábito"
              placeholder="Escolha um hábito..."
              value={habitId}
              options={habitList}
              onChange={(newSelectedId) => {
                setHabitId(newSelectedId);
                setHabitList(prev => prev.filter(item => !item.justAdded || (item.justAdded && item.value === newSelectedId)))
              }}
              createOption={createHabit}
            />
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Descrição (opcional)</Label>
            <Input
              placeholder="Ex: Treinar ao menos 45 minutos..."
              value={description}
              onChange={setDescription}
            />
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Período do Plano</Label>
            <DateRangeSelect
              startValueLabel="Data de Início"
              startValue={startDate}
              setStartValue={setStartDate}
              minValue={formatDate(getRelativeDate(+1))}
              finishValueLabel="Data de Término"
              finishValue={finishDate}
              setFinishValue={setFinishDate}
            />
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Folgas Permitidas por Semana</Label>
            <NumberSelect
              value={daysOffPerWeek}
              setValue={setDaysOffPerWeek}
              minValue={0}
              maxValue={6}
            />
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Multa por Descumprimento</Label>
            <SearchableSelect
              label="Selecione o Valor"
              value={penaltyValue.toString()}
              options={penaltyValueList}
              onChange={(newSelectedId) => {
                setPenaltyValue(Number.parseInt(newSelectedId));
              }}
            />
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Tipo de Plano</Label>
            <RadioButtonSelect selectedValue={planType} onChange={value => setPlanType(value as PlanType)} options={radioButtonOptions} />
          </Card>

          <Button className='p-0 overflow-hidden'>
            <LinearGradient
              colors={[getColor("violet"), getColor("purple-violet"), getColor("purple")]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              className="flex flex-col items-center justify-center w-full h-full">
              <Text style={{ color: getColor('white') }} className='text-lg font-bold'>Criar Plano</Text>
            </LinearGradient>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}