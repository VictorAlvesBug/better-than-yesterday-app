import Card from '@/src/components/card';
import { getColor } from '@/types/common.type';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View
} from 'react-native';
import BackButton from '../components/back-button';
import DateRangeSelect from '../components/date-range-select';
import Input from '../components/input';
import Label from '../components/label';
import NumberSelect from '../components/number-select';
import SearchableSelect, { type Option } from '../components/searchable-select';
import { formatDate, getRelativeDate } from '../utils/dateUtils';

const statusBarHeight = Constants.statusBarHeight;

export default function CreatePlanScreen() {
  const [habitId, setHabitId] = useState<string | null>()
  const [description, setDescription] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(formatDate(getRelativeDate(+1)));
  const [finishDate, setFinishDate] = useState<string>(formatDate(getRelativeDate(+365)));
  const [restsPerWeek, setRestsPerWeek] = useState<number>(2);

  const [habitItemList, setHabitItemList] = useState<Option[]>([
    {
      value: "1",
      label: "1"
    },
    {
      value: "2",
      label: "2"
    },
    {
      value: "3",
      label: "3"
    },
    {
      value: "4",
      label: "4"
    },
    {
      value: "5",
      label: "5"
    },
    {
      value: "6",
      label: "6"
    },
    {
      value: "7",
      label: "7"
    },
    {
      value: "8",
      label: "8"
    },
    {
      value: "9",
      label: "9"
    },
    {
      value: "10",
      label: "10"
    },
    {
      value: "11",
      label: "11"
    },
    {
      value: "12",
      label: "12"
    }
  ]);

  function createHabit(name: string) {
    const newHabit = {
      value: name,
      label: name
    }
    setHabitItemList((prev) => [...prev, newHabit])
  }


  return (
    <View
      className="flex-1"
      style={{ marginTop: statusBarHeight, backgroundColor: getColor("light-dark") }}
    >
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
          <View className="flex flex-row items-center justify-start w-full">
            <BackButton />

            <View className="flex flex-col items-center justify-center">
              <Text className="text-xl font-bold text-center text-white">
                Criar Plano
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="w-full px-4 gap-3 py-3">
          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Selecione o Hábito</Label>
            <SearchableSelect
              label="Selecione o Hábito"
              placeholder="Escolha um hábito..."
              value={habitId}
              options={habitItemList}
              onChange={setHabitId}
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
              value={restsPerWeek}
              setValue={setRestsPerWeek}
              minValue={0}
              maxValue={6}
            />
          </Card>

        </View>
      </ScrollView>
    </View>
  );
}
