import { CreateCheckin, createCheckinSchema } from '@/types/checkin.type';
import { getColor } from '@/types/color.type';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  View,
} from 'react-native';
import createCheckinRepository from '../api/checkinRepository';
import Memory from '../api/memory';
import createChallengeRepository from '../api/challengeRepository';
import createS3Repository from '../api/s3Repository';
import { Button } from '../components/button';
import Card from '../components/card';
import GradientView from '../components/gradient-view';
import Input from '../components/input';
import KeyboardableView from '../components/keyboardable-view';
import Label from '../components/label';
import NotFoundState from '../components/not-found-state';
import ScreenHeader from '../components/screen-header';
import ScreenLayout from '../components/screen-layout';
import useNavigation from '../hooks/useNavigation';
import {
  getDateComponents,
  getDateOnly,
  getDateOnlyWithOffset,
  getDateTime,
  getDateToFront,
} from '../utils/dateUtils';
import { checkIfIsValidAndToast, toastErrorMessage, toastSuccessMessage } from '../utils/toastUtils';
import { generateId } from '../utils/stringUtils';

export default function CreateCheckinScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ checkInId?: string }>();
  const replacingCheckInId = typeof params.checkInId === 'string' ? params.checkInId : '';
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [missing, setMissing] = useState<'checkin' | 'challenge' | null>(null);
  const [localPhotoUri, setLocalPhotoUri] = useState('');

  const [selectedDate, setSelectedDate] = useState(getDateOnly());
  const [challengeStartsAt, setChallengeStartsAt] = useState('');
  const [dateLocked, setDateLocked] = useState(false);
  const [takenToday, setTakenToday] = useState(false);
  const [takenYesterday, setTakenYesterday] = useState(false);
  const [checkin, setCheckin] = useState<Omit<CreateCheckin, 'date'>>({
    userId: '',
    challengeId: '',
    evidencePhotoUrl: '',
    title: '',
  });

  const challengeRepository = useMemo(() => createChallengeRepository(), []);
  const checkinRepository = useMemo(() => createCheckinRepository(), []);
  const s3Repository = createS3Repository();

  const openCamera = async (): Promise<string> => {
    const result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.back,
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled)
      throw new Error('Nenhuma foto capturada');

    return result.assets[0].uri;
  };

  const handleOpenCamera = async () => {
    try {
      const uri = await openCamera();
      setLocalPhotoUri(uri);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        toastErrorMessage(err.message);
        if (!localPhotoUri)
          navigation.back();
      } else {
        toastErrorMessage('A câmera não entrou em campo');
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const userId = await Memory.get('userId') || '';
      const challengeId = await Memory.get('challengeId') || '';

      if (replacingCheckInId) {
        try {
          const existing = await checkinRepository.getById(replacingCheckInId);
          setCheckin({
            userId,
            challengeId: existing.challengeId,
            evidencePhotoUrl: existing.evidencePhotoUrl,
            title: existing.title,
          });
          setSelectedDate(getDateOnly(existing.date));
          setDateLocked(true);
        } catch {
          setMissing('checkin');
        }
        setLoading(false);
        return;
      }

      let challenge;
      try {
        challenge = await challengeRepository.getById(challengeId);
      } catch {
        setMissing('challenge');
        setLoading(false);
        return;
      }

      if (!challenge) {
        setMissing('challenge');
        setLoading(false);
        return;
      }

      const challengeMembers = await challengeRepository.getChallengeMemberDetails(challengeId, userId);

      if (!challengeMembers) {
        toastErrorMessage('Você não está nessa partida');
        navigation.back();
        return;
      }

      if (challengeMembers.status === 'Blocked') {
        toastErrorMessage('Você está no banco. Quita a multa para voltar ao jogo');
        navigation.back();
        return;
      }

      setChallengeStartsAt(challenge.startsAt);

      const mine = await checkinRepository.list({ challengeId, userId });
      const todayDate = getDateOnly();
      const yesterdayDate = getDateOnlyWithOffset(-1);
      const hasToday = mine.some((item) => getDateOnly(item.date) === todayDate);
      const hasYesterday = mine.some((item) => getDateOnly(item.date) === yesterdayDate);
      setTakenToday(hasToday);
      setTakenYesterday(hasYesterday);
      const yesterdayAllowed = yesterdayDate >= challenge.startsAt;
      if (!hasToday)
        setSelectedDate(todayDate);
      else if (yesterdayAllowed && !hasYesterday)
        setSelectedDate(yesterdayDate);

      setCheckin({
        ...checkin,
        userId,
        challengeId,
      });

      setLoading(false);
    };

    if (loading)
      fetchData();
  }, []);

  if (loading)
    return <ActivityIndicator size="large" color={getColor('gray-6')} />;

  if (missing === 'checkin') {
    return (
      <NotFoundState
        title="Esse check-in sumiu"
        description="Ele não está mais disponível."
        primaryLabel="Voltar"
        onPrimary={() => navigation.back()}
      />
    );
  }

  if (missing === 'challenge') {
    return (
      <NotFoundState
        title="Esse desafio sumiu do mapa"
        description="Não deu para abrir o desafio desse check-in."
        primaryLabel="Voltar"
        onPrimary={() => navigation.back()}
      />
    );
  }

  const createCheckin = async () => {
    if (!localPhotoUri && !checkin.evidencePhotoUrl) {
      toastErrorMessage('Tira a foto da prova antes de marcar');
      return;
    }

    setSubmitting(true);

    try {
      const fileType = 'image/jpeg';
      const { year, month, day } = getDateComponents(selectedDate);
      const now = new Date();
      const submitDate = getDateTime(new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
      ));

      let evidencePhotoUrl = checkin.evidencePhotoUrl;
      if (localPhotoUri) {
        evidencePhotoUrl = await s3Repository.uploadFile({
          filePath: localPhotoUri,
          fileName: `checkins/${checkin.challengeId}/${checkin.userId}/${year}-${month}-${day}/${generateId()}.jpg`,
          fileType,
        });
      }

      if (replacingCheckInId) {
        await checkinRepository.replace(replacingCheckInId, checkin.userId, checkin.title, evidencePhotoUrl);
        toastSuccessMessage('Check-in trocado. A votação recomeça!');
        navigation.back();
        return;
      }

      const payload: CreateCheckin = { ...checkin, date: submitDate, evidencePhotoUrl };

      if (!checkIfIsValidAndToast(createCheckinSchema, payload))
        return;

      await checkinRepository.create(payload);
      toastSuccessMessage('Check-in na conta. Sequência protegida!');
      navigation.back();
    } catch (err) {
      console.error(err);
      const fallback = replacingCheckInId
        ? 'Não deu para trocar o check-in'
        : 'Não deu para marcar o check-in';
      toastErrorMessage(err instanceof Error && err.message ? err.message : fallback);
    } finally {
      setSubmitting(false);
    }
  };

  const today = getDateOnly();
  const yesterday = getDateOnlyWithOffset(-1);
  const yesterdayBeforeStart = challengeStartsAt !== '' && yesterday < challengeStartsAt;
  const dateOptions = [
    {
      label: 'Ontem',
      date: yesterday,
      disabled: dateLocked || yesterdayBeforeStart || takenYesterday,
    },
    {
      label: 'Hoje',
      date: today,
      disabled: dateLocked || takenToday,
    },
  ];

  return (
    <ScreenLayout header={<ScreenHeader title={replacingCheckInId ? 'Trocar check-in' : 'Marcar presença'} />}>
      <KeyboardableView>
        <View className="flex-1 w-full gap-6 px-4 py-3" style={{ backgroundColor: getColor('gray-e') }}>
          <Card className="relative flex flex-row items-center justify-center w-full">
            <View className="flex flex-col items-start justify-center w-full">
              {localPhotoUri || checkin.evidencePhotoUrl ? (
                <><Image
                  source={{ uri: localPhotoUri || checkin.evidencePhotoUrl }}
                  style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 16 }}
                />
                  <Button action={handleOpenCamera} className="absolute right-7 bottom-7">
                    Alterar foto
                  </Button>
                </>
              ) : (
                <View
                  style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 16, backgroundColor: getColor('gray-d') }}
                  className="items-center justify-center"
                >
                  <Button action={handleOpenCamera}>
                    Escolher foto
                  </Button>
                </View>
              )}
            </View>
          </Card>
          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Título</Label>
            <Input
              placeholder="Ex: Missão cumprida"
              value={checkin.title}
              onChange={(value) => setCheckin({ ...checkin, title: value })}
            />
          </Card>
          <Card className="flex flex-col items-start justify-center w-full gap-3">
            <Label>Data</Label>
            <View className="flex flex-row w-full gap-3">
              {dateOptions.map((option) => (
                <View key={option.label} className="flex flex-col flex-1 gap-1">
                  <Button
                    color={selectedDate === option.date
                      ? { text: 'black', border: 'violet', background: 'white' }
                      : { text: 'gray-3', border: 'gray-d', background: 'white' }}
                    className="border-2"
                    disabled={option.disabled}
                    action={() => setSelectedDate(option.date)}
                  >
                    {option.label}
                  </Button>
                  <Text style={{ color: getColor('gray-7') }} className="text-sm text-center">
                    {getDateToFront(option.date)}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
          <Button className="p-0 overflow-hidden" action={createCheckin} disabled={submitting}>
            <GradientView className="flex flex-col items-center justify-center w-full h-full py-4">
              {submitting ? (
                <ActivityIndicator color={getColor('white')} />
              ) : (
                <Text style={{ color: getColor('white') }} className="text-lg font-bold">{replacingCheckInId ? 'Trocar' : 'Marcar'}</Text>
              )}
            </GradientView>
          </Button>
        </View>
      </KeyboardableView>
    </ScreenLayout>
  );
}
