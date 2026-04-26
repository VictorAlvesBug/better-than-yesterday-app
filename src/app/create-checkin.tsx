import { CreateCheckin, createCheckinSchema } from '@/types/checkin.type';
import { getColor } from '@/types/color.type';
import Constants from 'expo-constants';
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Text, View
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
import { formatDateRelativeToToday, getDateComponents, getDateOnly, getDateToFront, getDateToFrontWithOffset } from '../utils/dateUtils';
import { checkIfIsValidAndToast, toastErrorMessage, toastSuccessMessage } from '../utils/toastUtils';

export default function CreateCheckinScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);

    const [checkin, setCheckin] = useState<CreateCheckin>({
        userId: '',
        planId: '',
        date: getDateOnly(),
        photoUrl: '',
        title: ''
    });

    const [file, setFile] = useState([]);
    const [currentFile, setCurrentFile] = useState('');


    const planRepository = createPlanRepository();
    const checkinRepository = createCheckinRepository();
    const s3Repository = createS3Repository();

    const openCamera = async (): Promise<string> => {
        const result = await ImagePicker.launchCameraAsync({
            cameraType: ImagePicker.CameraType.back,
            mediaTypes: ["images"],
            quality: 1,
            //base64: true
        });

        if (result.canceled) {
            throw new Error("Nenhuma foto capturada");
        }

        // TODO: Refactor to persist image only when checkin is created. Use Amazon S3

        const asset = result.assets[0];
        
        const { year, month, day} = getDateComponents(checkin.date);

        const params = {
                bucket: 'checkin-213615929868-sa-east-1-an',
                filePath: asset.uri.replace('file://', ''),
                fileName: `${checkin.userId}/${checkin.planId}/${year}/${month}/${day}.jpg`,
                fileType: 'image/jpeg'
        }

        await s3Repository.uploadFile(params);

        return asset.uri;
    };

    const handleOpenCamera = async () => {
        try {
            const url = await openCamera();
            setCheckin({ ...checkin, photoUrl: url });
        } catch (err) {
            if (err instanceof Error) {
                toastErrorMessage(err.message)
                if (!checkin.photoUrl) navigation.back();
                return;
            }

            toastErrorMessage('Ocorreu um erro');
        }
    };

    const handleUploadImage = async () => {
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
                    navigation.back();
                    return;
                }

                if (planMembers.some(planMember => planMember.status === 'blocked')) {
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
            }
        };

        fetchData();
        //handleOpenCamera();
    }, [Memory]);

    if (loading)
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
                    <Card className="relative flex flex-row items-center justify-center w-full">
                        <View className="flex flex-col items-start justify-center w-full">
                            <Image
                                source={{
                                    uri: checkin.photoUrl,
                                }}
                                style={{ width: '100%', aspectRatio: 4/3, borderRadius: 16 }}
                            />
                        </View>
                        <Button action={handleOpenCamera}
                        className='absolute right-7 bottom-7'>Alterar foto</Button>
                    </Card>
                    <Button action={handleUploadImage}>Persistir foto</Button>

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
