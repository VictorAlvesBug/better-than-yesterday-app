import { CreateCheckin, createCheckinSchema } from '@/types/checkin.type';
import { getColor } from '@/types/color.type';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Text, View
} from 'react-native';
import createCheckinRepository from '../api/checkinRepository';
import Memory from '../api/memory';
import createPlanRepository from '../api/planRepository';
import BackButton from '../components/back-button';
import { Button } from '../components/button';
import Card from '../components/card';
import { DateInput } from '../components/date-input';
import GradientView from '../components/gradient-view';
import Input from '../components/input';
import KeyboardableView from '../components/keyboardable-view';
import Label from '../components/label';
import useNavigation from '../hooks/useNavigation';
import { formatDateRelativeToToday, getDateOnly, getDateToFront, getDateToFrontWithOffset } from '../utils/dateUtils';
import { checkIfIsValidAndToast, toastErrorMessage, toastInfoMessage, toastSuccessMessage } from '../utils/toastUtils';

export default function CreateCheckinScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);

    const [checkin, setCheckin] = useState<CreateCheckin | null>(null);

    const planRepository = createPlanRepository();
    const checkinRepository = createCheckinRepository();

  const pickImage = async () => {
      toastInfoMessage("TODO: Pick Gallery Photo");
    /*const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      toastInfoMessage(result.assets[0].uri);
        //setCheckin({...checkin, photoUrl: result.assets[0].uri});
    }*/
  };

    useEffect(() => {
        const fetchData = async () => {
            if (loading) {

                const userId = await Memory.get('userId') || '';
                const planId = await Memory.get('planId') || '';

                const planMembers = await planRepository.listPlanMembers({
                    userId,
                    planId
                });

                if (planMembers.length === 0) {
                    toastErrorMessage('Você não faz parte deste plano');
                    return;
                }

                if (planMembers.some(planMember => planMember.status === 'blocked')) {
                    toastErrorMessage('Você está bloqueado. Pague a multa para continuar participando');
                    return;
                }

                setCheckin({
                    userId,
                    planId,
                    date: getDateOnly(),
                    photoUrl: '',
                    title: ''
                });

                setLoading(false);
            }
        };

        fetchData();
    }, [Memory]);

    if (loading || !checkin)
        return <ActivityIndicator size="large" color={getColor("gray-6")} />

    const createCheckin = async () => {
        if (!checkIfIsValidAndToast(createCheckinSchema, checkin)) {
            return;
        }

        await checkinRepository.create(checkin);
        toastSuccessMessage('Plano criado com sucesso');
        navigation.back();
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
                    Marcar Check-in
                </Text>
            </GradientView>
            <KeyboardableView>
                <View
                    className="flex-1 w-full gap-6 px-4 py-3"
                    style={{ backgroundColor: getColor("gray-e") }}
                >
                    <Card className="flex flex-row items-center justify-center w-full gap-3">
                        <View className="flex flex-col items-start justify-center gap-1 w-fit">
                            <Image
                                source={{
                                    uri: checkin.photoUrl,
                                }}
                                style={{ width: 80, height: 80, borderRadius: 20 }}
                            />
                        </View>
                        <Button action={pickImage}>Escolher uma foto</Button>
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

                    <Button className='p-0 overflow-hidden' action={createCheckin}>
                        <GradientView className="flex flex-col items-center justify-center w-full h-full">
                            <Text style={{ color: getColor('white') }} className='text-lg font-bold'>Marcar</Text>
                        </GradientView>
                    </Button>
                </View>
            </KeyboardableView>
        </>
    );
}
