import { CreateCheckin, createCheckinSchema } from '@/types/checkin.type';
import { getColor } from '@/types/color.type';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
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
import BackButton from '../components/back-button';
import { Button } from '../components/button';
import Card from '../components/card';
import { DateInput } from '../components/date-input';
import GradientView from '../components/gradient-view';
import Input from '../components/input';
import KeyboardableView from '../components/keyboardable-view';
import Label from '../components/label';
import useNavigation from '../hooks/useNavigation';
import {
  formatDateRelativeToToday,
  getDateComponents,
  getDateOnly,
  getDateToFront,
  getDateToFrontWithOffset,
} from '../utils/dateUtils';
import { checkIfIsValidAndToast, toastErrorMessage, toastSuccessMessage } from '../utils/toastUtils';
import { generateId } from '../utils/stringUtils';

export default function CreateCheckinScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [localPhotoUri, setLocalPhotoUri] = useState('');

  const [checkin, setCheckin] = useState<CreateCheckin>({
    userId: '',
    planId: '',
    date: getDateOnly(),
    photoUrl: '',
    title: '',
  });

  const planRepository = createPlanRepository();
  const checkinRepository = createCheckinRepository();
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

  const createCheckin = async () => {
    if (!localPhotoUri) {
      toastErrorMessage('Tire uma foto antes de marcar o check-in');
      return;
    }

    setSubmitting(true);

    try {
      const assetUri = localPhotoUri;
      const fileType = 'image/jpeg';
      const { year, month, day } = getDateComponents(checkin.date);
      
      const photoUrl = await s3Repository.uploadFile({
        filePath: assetUri,
        fileName: `checkins/${checkin.planId}/${checkin.userId}/${year}-${month}-${day}/${generateId()}.jpg`,
        //fileName: `checkins/${checkin.planId}/${checkin.userId}/${year}-${month}-${day}/photo.jpg`, //TODO: Usar este quando terminar de testar com "MoveInTimeUseCase"
        fileType,
      });

      const payload = { ...checkin, photoUrl };

      if (!checkIfIsValidAndToast(createCheckinSchema, payload))
        return;

      await checkinRepository.create(payload);
      toastSuccessMessage('Check-in criado com sucesso');
      navigation.back();
    } catch (err) {
      console.error(err);
      toastErrorMessage('Erro ao criar check-in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <GradientView
        style={{ paddingTop: Constants.statusBarHeight }}
        className="flex flex-row items-center justify-start w-full"
      >
        <BackButton />
        <Text className="text-xl font-bold text-center text-white">Marcar Check-in</Text>
      </GradientView>
      <KeyboardableView>
        <View className="flex-1 w-full gap-6 px-4 py-3" style={{ backgroundColor: getColor('gray-e') }}>
          <Card className="relative flex flex-row items-center justify-center w-full">
            <View className="flex flex-col items-start justify-center w-full">
              {localPhotoUri ? (
                <Image
                  source={{ uri: localPhotoUri }}
                  style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 16 }}
                />
              ) : (
                <View
                  style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 16, backgroundColor: getColor('gray-d') }}
                  className="items-center justify-center"
                >
                  <Text style={{ color: getColor('gray-7') }}>Nenhuma foto selecionada</Text>
                </View>
              )}
            </View>
            <Button action={handleOpenCamera} className="absolute right-7 bottom-7">
              Escolher foto
            </Button>
          </Card>
          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Título</Label>
            <Input
              placeholder="Ex: Missão cumprida"
              value={checkin.title}
              onChange={(value) => setCheckin({ ...checkin, title: value })}
            />
          </Card>
          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Data</Label>
            <DateInput
              value={getDateToFront(checkin.date)}
              setValue={(value) => setCheckin({ ...checkin, date: getDateOnly(value) })}
              minValue={getDateToFrontWithOffset(-1)}
              maxValue={getDateToFront()}
              formatValueDescription={formatDateRelativeToToday}
            />
          </Card>
          <Button className="p-0 overflow-hidden" action={createCheckin} disabled={submitting}>
            <GradientView className="flex flex-col items-center justify-center w-full h-full py-4">
              {submitting ? (
                <ActivityIndicator color={getColor('white')} />
              ) : (
                <Text style={{ color: getColor('white') }} className="text-lg font-bold">Marcar</Text>
              )}
            </GradientView>
          </Button>
        </View>
      </KeyboardableView>
    </>
  );
}
