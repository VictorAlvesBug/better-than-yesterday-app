import createHabitRepository from '@/src/api/habitRepository';
import Memory from '@/src/api/memory';
import createChallengeRepository from '@/src/api/challengeRepository';
import createS3Repository from '@/src/api/s3Repository';
import Card from '@/src/components/card';
import { getColor } from '@/types/color.type';
import { Habit, HabitWithJustAdded } from '@/types/habit.type';
import { CreateChallenge, createChallengeSchema, parsePenaltyValue, PenaltyOption, penaltyValueOptions, ChallengeType } from '@/types/challenge.type';
import { useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Switch,
  Text,
  View
} from 'react-native';
import AmountSelect from '../components/amount-select';
import { Button } from '../components/button';
import DateRangeSelect from '../components/date-range-select';
import GradientView from '../components/gradient-view';
import Input from '../components/input';
import KeyboardableView from '../components/keyboardable-view';
import Label from '../components/label';
import RadioButtonSelect, { RadioButtonOption } from '../components/radio-button-select';
import ScreenHeader from '../components/screen-header';
import ScreenLayout from '../components/screen-layout';
import Select from '../components/select';
import useNavigation from '../hooks/useNavigation';
import { DateOnly, formatDateRelativeToToday, getDateOnly, getDateOnlyWithOffset, getDateTime, getDateToFront, getDateToFrontWithOffset } from '../utils/dateUtils';
import { formatMoney } from '../utils/numberUtils';
import { generateId } from '../utils/stringUtils';
import { checkIfIsValidAndToast, toastErrorMessage, toastSuccessMessage } from '../utils/toastUtils';

export default function CreateChallengeScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    habitId?: string;
    description?: string;
    type?: string;
    daysOffPerWeek?: string;
    penaltyValue?: string;
    startsAt?: string;
    endsAt?: string;
    coverPhotoUrl?: string;
  }>();
  const [loading, setLoading] = useState(true);

  const [daysPerWeek, setDaysPerWeek] = useState(5);

  const [challenge, setChallenge] = useState<CreateChallenge | null>(null);

  const [joinAfterCreated, setJoinAfterCreated] = useState(false);

  const [localCoverUri, setLocalCoverUri] = useState<string | null>(null);
  const [habitList, setHabitList] = useState<HabitWithJustAdded[]>([]);
  const s3Repository = useMemo(() => createS3Repository(), []);

  const habitRepository = useMemo(() => createHabitRepository(), []);
  const challengeRepository = useMemo(() => createChallengeRepository(), []);

  const penaltyOptions = penaltyValueOptions.map((penaltyValue): PenaltyOption => ({
    id: penaltyValue.toString(),
    label: formatMoney(penaltyValue)
  }));

  function createHabit(habitName: string) {
    const temporaryId = generateId();
    const justAddedHabit: HabitWithJustAdded = {
      id: temporaryId,
      name: habitName,
      justAdded: true,
      createdAt: getDateTime()
    };
    setHabitList((prev) => [...prev, justAddedHabit])
    return justAddedHabit;
  }

  const radioButtonOptions: RadioButtonOption[] = [{
    value: 'Private',
    icon: { name: 'lock-closed-outline', size: 20 },
    title: 'Privado',
    complement: 'Apenas para amigos e família'
  },
  {
    value: 'Public',
    icon: { name: 'globe-outline', size: 20 },
    title: 'Público',
    complement: 'Qualquer pessoa pode participar'
  }]

  useEffect(() => {
    const fetchData = async () => {
      if (loading) {
        const habits = await habitRepository.list();
        setHabitList(habits);

        const userId = await Memory.get('userId') || '';

        const duplicatedDaysOff = Number(params.daysOffPerWeek);
        const commitment = Number.isFinite(duplicatedDaysOff) ? 7 - duplicatedDaysOff : daysPerWeek;
        if (Number.isFinite(duplicatedDaysOff))
          setDaysPerWeek(commitment);

        setChallenge({
          ownerId: userId,
          habitId: params.habitId || '',
          description: params.description || undefined,
          startsAt: (params.startsAt || getDateOnlyWithOffset(1)) as DateOnly,
          endsAt: (params.endsAt || getDateOnlyWithOffset(8)) as DateOnly,
          daysOffPerWeek: Number.isFinite(duplicatedDaysOff) ? duplicatedDaysOff : daysPerWeek,
          penaltyValue: params.penaltyValue ? parsePenaltyValue(String(params.penaltyValue)) : 10,
          type: params.type === 'Public' ? 'Public' : 'Private',
          coverPhotoUrl: params.coverPhotoUrl || undefined,
        });

        setLoading(false);
      }
    };

    fetchData();
  }, [habitRepository, Memory]);

  //if (!challenge)
  //  return <ActivityIndicator size="large" color={getColor("gray-6")} />

  const createChallenge = async () => {
    if (loading || !challenge)
      return;

    const habit = habitList.find(h => h.id === challenge.habitId);

    if (!habit) {
      toastErrorMessage('Escolhe um hábito para criar o desafio.');
      return;
    }

    if (habit.justAdded){
      const newHabit = await habitRepository.create({
        name: habit.name,
      });
      challenge.habitId = newHabit.id;
    }

    challenge.ownerId = await Memory.get('userId') || '';


    challenge.daysOffPerWeek = 7 - daysPerWeek;

    if (localCoverUri) {
      challenge.coverPhotoUrl = await s3Repository.uploadFile({
        filePath: localCoverUri,
        fileName: `covers/${challenge.ownerId}/${generateId()}.jpg`,
        fileType: 'image/jpeg',
      });
    }

    if (!checkIfIsValidAndToast(createChallengeSchema, challenge)) {
      return;
    }

    const createdChallenge = await challengeRepository.create(challenge);

    toastSuccessMessage('Desafio criado. Chama a galera!');

    if (joinAfterCreated) {
      await challengeRepository.join({ challengeId: createdChallenge.id, userId: challenge.ownerId });
      const forceReload = await Memory.get('challengeId') !== createdChallenge.id;
      await Memory.set('challengeId', createdChallenge.id);
      navigation.push('/challenge-tracker', forceReload);
      return;
    }

    navigation.back();
  };

  if (!challenge){
    return;
  }

  return (
    <ScreenLayout header={<ScreenHeader title="Criar desafio" />}>
      <KeyboardableView>
        {loading ? (
          <ActivityIndicator size="large" color={getColor("gray-6")} />
        ) :
          (
            <View
              className="flex-1 w-full gap-6 px-4 py-3"
              style={{ backgroundColor: getColor("gray-e") }}
            >
              <Card className="flex flex-col items-start justify-center w-full gap-1">
                <Label>Hábitos</Label>
                <Select<Habit>
                  enableSearch={true}
                  label="Selecione o Hábito"
                  placeholder="Escolha um hábito..."
                  value={challenge.habitId}
                  formatOptionLabel={habit => habit.name}
                  options={habitList}
                  onChange={selectedHabit => {
                    setChallenge({ ...challenge, habitId: selectedHabit.id });
                    setHabitList(prev => prev.filter(item => !item.justAdded || (item.justAdded && item.id === selectedHabit.id)))
                  }}
                  createOption={createHabit}
                />
              </Card>

              <Card className="flex flex-col items-start justify-center w-full gap-1">
                <Label>Descrição (opcional)</Label>
                <Input
                  placeholder="Ex: Treinar ao menos 45 minutos..."
                  value={challenge.description}
                  onChange={(value) => setChallenge({ ...challenge, description: value })}
                />
              </Card>

              <Card className="flex flex-col items-start justify-center w-full gap-2">
                <Label>Capa (opcional)</Label>
                {(localCoverUri || challenge.coverPhotoUrl) && (
                  <Image
                    source={{ uri: localCoverUri || challenge.coverPhotoUrl }}
                    style={{ width: '100%', height: 140, borderRadius: 12 }}
                  />
                )}
                <Pressable
                  onPress={async () => {
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ['images'],
                      quality: 0.8,
                    });
                    if (!result.canceled && result.assets[0])
                      setLocalCoverUri(result.assets[0].uri);
                  }}
                >
                  <Text style={{ color: getColor('violet') }} className="text-sm font-semibold">
                    Escolher foto
                  </Text>
                </Pressable>
              </Card>

              <Card className="flex flex-col items-start justify-center w-full gap-1">
                <Label>Período do desafio</Label>
                <DateRangeSelect
                  startValueLabel="Data de Início"
                  startValue={getDateToFront(challenge.startsAt)}
                  setStartValue={startsAt => setChallenge({ ...challenge, startsAt: getDateOnly(startsAt) })}
                  formatStartDescription={formatDateRelativeToToday}
                  minValue={getDateToFrontWithOffset(+1)}
                  endValueLabel="Data de Término"
                  endValue={getDateToFront(challenge.endsAt)}
                  setEndValue={endsAt => setChallenge({ ...challenge, endsAt: getDateOnly(endsAt) })}
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
                <Label>Multa se furar</Label>
                <Select<PenaltyOption>
                  label="Selecione o Valor"
                value={challenge.penaltyValue.toString()}
                formatOptionLabel={penaltyValue => penaltyValue.label}
                options={penaltyOptions}
                onChange={selectedPenaltyValue => {
                  setChallenge({ ...challenge, penaltyValue: parsePenaltyValue(selectedPenaltyValue.id) });
                }}
              />
              </Card>

              <Card className="flex flex-col items-start justify-center w-full gap-1">
                <Label>Tipo de desafio</Label>
                <RadioButtonSelect
                  selectedValue={challenge.type}
                  onChange={value => setChallenge({ ...challenge, type: value as ChallengeType })}
                  options={radioButtonOptions} />
              </Card>

              <Card className="flex flex-row items-center justify-between w-full gap-1">
                <Label>Entrar na partida</Label>
                <Switch
                  value={joinAfterCreated}
                  onValueChange={checked => setJoinAfterCreated(checked)}
                  trackColor={{ true: getColor('light-purple'), false: getColor('gray-9') }}
                  thumbColor={getColor(joinAfterCreated ? 'light-violet' : 'gray-d')}
                  ios_backgroundColor="#767577"
                />
              </Card>

              <Button className='p-0 overflow-hidden' action={createChallenge}>
                <GradientView className="flex flex-col items-center justify-center w-full h-full">
                  <Text style={{ color: getColor('white') }} className='text-lg font-bold'>Criar desafio</Text>
                </GradientView>
              </Button>
            </View>
          )}

      </KeyboardableView>
    </ScreenLayout>
  );
}