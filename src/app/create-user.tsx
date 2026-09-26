import Memory from '@/src/api/memory';
import createUserRepository from '@/src/api/userRepository';
import { getColor } from '@/types/color.type';
import {
  CreateUser,
  createUserSchema,
  PIX_KEY_TYPE_LABELS,
  PixKeyType,
  pixKeyTypeSchema,
} from '@/types/user.type';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native';
import { Button } from '../components/button';
import Card from '../components/card';
import GradientView from '../components/gradient-view';
import Icon from '../components/icon';
import Input from '../components/input';
import KeyboardableView from '../components/keyboardable-view';
import Label from '../components/label';
import ScreenHeader from '../components/screen-header';
import ScreenLayout from '../components/screen-layout';
import Select from '../components/select';
import { useAuth } from '../context/auth';
import useNavigation from '../hooks/useNavigation';
import {
  isLocalImageUri,
  promptProfilePhotoPicker,
  uploadProfilePhoto,
} from '../utils/profilePhotoUtils';
import { checkIfIsValidAndToast, toastErrorMessage } from '../utils/toastUtils';

export default function CreateUserScreen() {
  const { isSignedIn, signOut, authUser } = useAuth();
  const navigation = useNavigation();
  const userRepository = useMemo(() => createUserRepository(), []);
  const pixKeyInputRef = useRef<TextInput | null>(null);

  const [user, setUser] = useState<CreateUser | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !authUser)
      return;

    const fetchUser = async () => {
      const dbUser = await userRepository.get({ email: authUser.email }).catch(() => {
        setUser({
          email: authUser.email,
          name: authUser.name ?? '',
          nickname: authUser.name ?? '',
          photoUrl: authUser.photo ?? '',
          phoneNumber: '',
          pixKey: authUser.email,
          pixKeyType: 'Email' as PixKeyType,
        });

        return;
      });

      if (!dbUser) {
        setUser({
          email: authUser.email,
          name: authUser.name ?? '',
          nickname: authUser.name ?? '',
          photoUrl: authUser.photo ?? '',
          phoneNumber: '',
          pixKey: authUser.email,
          pixKeyType: 'Email' as PixKeyType,
        });

        return;
      }
    };

    fetchUser();
  }, [authUser, isSignedIn, navigation, userRepository]);

  if (!authUser || !user)
    return null;

  const onChangeHandler = (field: keyof CreateUser, value: string) => {
    setUser(prev => ({ ...prev as CreateUser, [field]: value }));
  }

  const onPickPhoto = () => {
    promptProfilePhotoPicker(({ localUri }) => {
      onChangeHandler('photoUrl', localUri);
    });
  };

  const createUser = async () => {
    if (!checkIfIsValidAndToast(createUserSchema, user)) {
      return;
    }

    try {
      setSaving(true);
      let photoUrl = user.photoUrl;
      if (isLocalImageUri(photoUrl)) {
        photoUrl = await uploadProfilePhoto(photoUrl, user.email);
      }

      const createdUser = await userRepository.create({
        ...user,
        photoUrl,
      });

      await Memory.set('userId', createdUser.id);
      navigation.replace('./manage-plans');
    } catch (error) {
      toastErrorMessage(error instanceof Error ? error.message : 'Não foi possível cadastrar');
    } finally {
      setSaving(false);
    }
  };

  const predefinedPixKey = (keyType: PixKeyType) => {
    if (keyType === 'Email') return user.email;
    if (keyType === 'PhoneNumber') return user.phoneNumber;
    return '';
  }

  return (
    <ScreenLayout
      header={
        <ScreenHeader
          title="Seja bem-vindo!"
          left={<View className="w-20 h-20" />}
          right={
            <Pressable
              className="flex items-center justify-center w-20 h-20"
              onPress={() => {
                signOut();
              }}
            >
              <Icon name="log-out-outline" size={24} color="white" />
            </Pressable>
          }
        />
      }
    >
      <KeyboardableView>
        <View
          style={{
            backgroundColor: getColor("gray-e"),
          }}
          className="flex-1 w-full gap-6 px-4 py-3"
        >
          <Card className="flex flex-row items-center justify-center w-full gap-3">
            <Pressable
              className="flex flex-col items-center justify-center gap-1 w-fit"
              onPress={onPickPhoto}
            >
              <Image
                source={{
                  uri: user.photoUrl || undefined,
                }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 9999,
                  backgroundColor: getColor('gray-d'),
                }}
              />
              <Text style={{ color: getColor('violet') }} className="text-xs font-semibold">
                Alterar foto
              </Text>
            </Pressable>

            <View className="flex flex-col items-start justify-center flex-1 gap-1">
              <Label>Nickname</Label>
              <Input
                inputType='nickname'
                value={user.nickname}
                onChange={(value) => {
                  onChangeHandler('nickname', value);
                }}
              />
            </View>
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>E-mail</Label>
            <Input
              inputType='email'
              value={user.email}
              typeable={false}
              grayBackground
            />
          </Card>

          {/* <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Fake Field 2</Label>
            <Input
              inputType='default'
              value={'Fake Field 1'}
              typeable={false}
              grayBackground
            />
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Fake Field 1</Label>
            <Input
              inputType='default'
              value={'Fake Field 1'}
              typeable={false}
              grayBackground
            />
          </Card> */}

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Celular</Label>
            <Input
              inputType='phone-number'
              value={user.phoneNumber}
              onChange={(value) => {
                onChangeHandler('phoneNumber', value);
              }}
            />
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Select<PixKeyType>
              label="Selecione o Tipo de Chave Pix"
              placeholder="Escolha um tipo de chave..."
              value={user.pixKeyType}
              formatOptionLabel={keyType => PIX_KEY_TYPE_LABELS[keyType]}
              options={Object.values(pixKeyTypeSchema.enum)}
              onChange={selectedKeyType => {
                setUser(prev => ({
                  ...prev as CreateUser,
                  pixKeyType: selectedKeyType,
                  pixKey: predefinedPixKey(selectedKeyType),
                }));
                pixKeyInputRef.current?.focus();
              }}
            />
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Chave Pix</Label>
            <Input
              ref={pixKeyInputRef}
              inputType={user.pixKeyType === 'PhoneNumber' ? 'phone-number' : 'pix-key'}
              value={user.pixKey}
              onChange={(value) => {
                onChangeHandler('pixKey', value);
              }}
            />
          </Card>

          <Button
            className='p-0 overflow-hidden'
            action={saving ? async () => undefined : createUser}>
            <GradientView
              className="flex flex-col items-center justify-center w-full h-full">
              <Text style={{ color: getColor('white') }} className='text-lg font-bold'>
                {saving ? 'Salvando...' : 'Salvar'}
              </Text>
            </GradientView>
          </Button>
        </View>
      </KeyboardableView>
    </ScreenLayout>
  );
}
