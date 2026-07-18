import Memory from '@/src/api/memory';
import createUserRepository from '@/src/api/userRepository';
import { getColor } from '@/types/color.type';
import {
  PIX_KEY_TYPE_LABELS,
  PixKeyType,
  pixKeyTypeSchema,
  updateUserSchema,
  User,
} from '@/types/user.type';
import Constants from 'expo-constants';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import BackButton from '../components/back-button';
import { Button } from '../components/button';
import Card from '../components/card';
import GradientView from '../components/gradient-view';
import Input from '../components/input';
import Label from '../components/label';
import Select from '../components/select';
import useNavigation from '../hooks/useNavigation';
import {
  isLocalImageUri,
  promptProfilePhotoPicker,
  uploadProfilePhoto,
} from '../utils/profilePhotoUtils';
import { checkIfIsValidAndToast, toastErrorMessage, toastSuccessMessage } from '../utils/toastUtils';

type EditableUser = {
  id: string;
  name: string;
  email: string;
  nickname: string;
  phoneNumber: string;
  photoUrl: string;
  pixKey: string;
  pixKeyType: PixKeyType;
};

export default function SettingsScreen() {
  const navigation = useNavigation();
  const userRepository = useMemo(() => createUserRepository(), []);
  const [user, setUser] = useState<EditableUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = await Memory.get('userId') || '';
      if (!userId) {
        navigation.replace('/login');
        return;
      }

      const dbUser = await userRepository.getById(userId);
      setUser({
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        nickname: dbUser.nickname,
        phoneNumber: dbUser.phoneNumber,
        photoUrl: dbUser.photoUrl,
        pixKey: dbUser.pixKey,
        pixKeyType: dbUser.pixKeyType,
      });
      setLoading(false);
    };

    fetchUser();
  }, [navigation, userRepository]);

  const onChangeHandler = (field: keyof EditableUser, value: string) => {
    setUser((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const onPickPhoto = () => {
    promptProfilePhotoPicker(({ localUri }) => {
      onChangeHandler('photoUrl', localUri);
    });
  };

  const saveUser = async () => {
    if (!user) return;

    if (!checkIfIsValidAndToast(updateUserSchema, {
      id: user.id,
      nickname: user.nickname,
      phoneNumber: user.phoneNumber,
      photoUrl: user.photoUrl,
      pixKey: user.pixKey,
      pixKeyType: user.pixKeyType,
    })) {
      return;
    }

    try {
      setSaving(true);
      let photoUrl = user.photoUrl;
      if (isLocalImageUri(photoUrl)) {
        photoUrl = await uploadProfilePhoto(photoUrl, user.id);
      }

      const updated = await userRepository.update({
        id: user.id,
        name: user.name,
        email: user.email,
        nickname: user.nickname,
        phoneNumber: user.phoneNumber,
        photoUrl,
        pixKey: user.pixKey,
        pixKeyType: user.pixKeyType,
      });

      setUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        nickname: updated.nickname,
        phoneNumber: updated.phoneNumber,
        photoUrl: updated.photoUrl,
        pixKey: updated.pixKey,
        pixKeyType: updated.pixKeyType,
      });
      toastSuccessMessage('Dados atualizados com sucesso');
      navigation.back();
    } catch (error) {
      toastErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar');
    } finally {
      setSaving(false);
    }
  };

  const predefinedPixKey = (keyType: PixKeyType) => {
    if (!user) return '';
    if (keyType === 'Email') return user.email;
    if (keyType === 'PhoneNumber') return user.phoneNumber;
    return '';
  }

  if (loading || !user) {
    return (
      <View className="items-center justify-center flex-1" style={{ backgroundColor: getColor('gray-e') }}>
        <ActivityIndicator size="large" color={getColor('gray-6')} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: getColor('gray-e') }}>
      <GradientView style={{ paddingTop: Constants.statusBarHeight }} className="flex flex-row items-center w-full">
        <BackButton />
        <Text className="text-xl font-bold text-white">Configurações</Text>
      </GradientView>
      <ScrollView className="flex-1 px-4 py-4" keyboardShouldPersistTaps="handled">
        <Card className="flex flex-row items-center justify-center w-full gap-3 mb-4">
          <Pressable onPress={onPickPhoto}>
            <Image
              source={{ uri: user.photoUrl || undefined }}
              style={{ width: 80, height: 80, borderRadius: 9999, backgroundColor: getColor('gray-d') }}
            />
            <Text style={{ color: getColor('violet') }} className="mt-1 text-xs text-center font-semibold">
              Alterar foto
            </Text>
          </Pressable>
          <View className="flex flex-col items-start justify-center flex-1 gap-1">
            <Label>Nickname</Label>
            <Input
              inputType="nickname"
              value={user.nickname}
              onChange={(value) => onChangeHandler('nickname', value)}
            />
          </View>
        </Card>

        <Card className="flex flex-col items-start justify-center w-full gap-1 mb-4">
          <Label>E-mail</Label>
          <Input inputType="email" value={user.email} typeable={false} grayBackground />
        </Card>

        <Card className="flex flex-col items-start justify-center w-full gap-1 mb-4">
          <Label>Celular</Label>
          <Input
            inputType="phone-number"
            value={user.phoneNumber}
            onChange={(value) => onChangeHandler('phoneNumber', value)}
          />
        </Card>

        <Card className="flex flex-col items-start justify-center w-full gap-1 mb-4">
          <Select<PixKeyType>
            label="Tipo de Chave Pix"
            placeholder="Escolha um tipo de chave..."
            value={user.pixKeyType}
            formatOptionLabel={(keyType) => PIX_KEY_TYPE_LABELS[keyType]}
            options={Object.values(pixKeyTypeSchema.enum)}
            onChange={(selectedKeyType) => {
              setUser((prev) =>
                prev
                  ? {
                      ...prev,
                      pixKeyType: selectedKeyType,
                      pixKey: predefinedPixKey(selectedKeyType),
                    }
                  : prev,
              );
            }}
          />
        </Card>

        <Card className="flex flex-col items-start justify-center w-full gap-1 mb-4">
          <Label>Chave Pix</Label>
          <Input
            inputType={user.pixKeyType === 'PhoneNumber' ? 'phone-number' : 'pix-key'}
            value={user.pixKey}
            onChange={(value) => onChangeHandler('pixKey', value)}
          />
        </Card>

        <Card className="flex flex-col gap-1 mb-4">
          <Label>Versão do app</Label>
          <Text style={{ color: getColor('black') }} className="text-base">
            {Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
        </Card>

        <Button
          className="p-0 mb-4 overflow-hidden"
          action={saving ? async () => undefined : saveUser}
        >
          <GradientView className="flex flex-col items-center justify-center w-full h-full py-3">
            <Text style={{ color: getColor('white') }} className="text-lg font-bold">
              {saving ? 'Salvando...' : 'Salvar'}
            </Text>
          </GradientView>
        </Button>
      </ScrollView>
    </View>
  );
}
