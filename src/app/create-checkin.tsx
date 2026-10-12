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
import createPlanRepository from '../api/planRepository';
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
  const [missing, setMissing] = useState<'checkin' | 'plan' | null>(null);
  const [localPhotoUri, setLocalPhotoUri] = useState('');

  const [selectedDate, setSelectedDate] = useState(getDateOnly());
  const [planStartsAt, setPlanStartsAt] = useState('');
  const [checkin, setCheckin] = useState<Omit<CreateCheckin, 'date'>>({
    userId: '',
    planId: '',
    evidencePhotoUrl: '',
    title: '',
  });

  const planRepository = useMemo(() => createPlanRepository(), []);
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
        toastErrorMessage('Ocorreu um erro');
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const userId = await Memory.get('userId') || '';
      const planId = await Memory.get('planId') || '';

      if (replacingCheckInId) {
        try {
          const existing = await checkinRepository.getById(replacingCheckInId);
          setCheckin({
            userId,
            planId: existing.planId,
            evidencePhotoUrl: existing.evidencePhotoUrl,
            title: existing.title,
          });
        } catch {
          setMissing('checkin');
        }
        setLoading(false);
        return;
      }

      let plan;
      try {
        plan = await planRepository.getById(planId);
      } catch {
        setMissing('plan');
        setLoading(false);
        return;
      }

      if (!plan) {
        setMissing('plan');
        setLoading(false);
        return;
      }

      const planMembers = await planRepository.getPlanMemberDetails(planId, userId);

      if (!planMembers) {
        toastErrorMessage('Você não faz parte deste plano');
        navigation.back();
        return;
      }

      if (planMembers.status === 'Blocked') {
        toastErrorMessage('Você está bloqueado. Pague a multa para continuar participando');
        navigation.back();
        return;
      }

      setPlanStartsAt(plan.startsAt);

      setCheckin({
        ...checkin,
        userId,
        planId,
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
        title="Ops, check-in não encontrado"
        description="Esse check-in não está mais disponível."
        primaryLabel="Voltar"
        onPrimary={() => navigation.back()}
      />
    );
  }

  if (missing === 'plan') {
    return (
      <NotFoundState
        title="Ops, plano não encontrado"
        description="Não foi possível abrir o plano deste check-in."
        primaryLabel="Voltar"
        onPrimary={() => navigation.back()}
      />
    );
  }

  const createCheckin = async () => {
    if (!localPhotoUri && !checkin.evidencePhotoUrl) {
      toastErrorMessage('Tire uma foto antes de marcar o check-in');
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
          fileName: `checkins/${checkin.planId}/${checkin.userId}/${year}-${month}-${day}/${generateId()}.jpg`,
          fileType,
        });
      }

      if (replacingCheckInId) {
        await checkinRepository.replace(replacingCheckInId, checkin.userId, checkin.title, evidencePhotoUrl);
        toastSuccessMessage('Check-in substituído com sucesso');
        navigation.back();
        return;
      }

      const payload: CreateCheckin = { ...checkin, date: submitDate, evidencePhotoUrl };

      if (!checkIfIsValidAndToast(createCheckinSchema, payload))
        return;

      await checkinRepository.create(payload);
      toastSuccessMessage('Check-in criado com sucesso');
      navigation.back();
    } catch (err) {
      console.error(err);
      const fallback = replacingCheckInId
        ? 'Não foi possível substituir o check-in'
        : 'Erro ao criar check-in';
      toastErrorMessage(err instanceof Error && err.message ? err.message : fallback);
    } finally {
      setSubmitting(false);
    }
  };

  const today = getDateOnly();
  const yesterday = getDateOnlyWithOffset(-1);
  const dateOptions = [
    { label: 'Hoje', date: today, disabled: false },
    { label: 'Ontem', date: yesterday, disabled: planStartsAt !== '' && yesterday < planStartsAt },
  ];

  return (
    <ScreenLayout header={<ScreenHeader title={replacingCheckInId ? 'Substituir check-in' : 'Marcar Check-in'} />}>
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
          {!replacingCheckInId && (
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
          )}
          <Button className="p-0 overflow-hidden" action={createCheckin} disabled={submitting}>
            <GradientView className="flex flex-col items-center justify-center w-full h-full py-4">
              {submitting ? (
                <ActivityIndicator color={getColor('white')} />
              ) : (
                <Text style={{ color: getColor('white') }} className="text-lg font-bold">{replacingCheckInId ? 'Substituir' : 'Marcar'}</Text>
              )}
            </GradientView>
          </Button>
        </View>
      </KeyboardableView>
    </ScreenLayout>
  );
}
