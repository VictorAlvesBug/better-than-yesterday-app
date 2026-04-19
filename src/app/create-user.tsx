import Memory from '@/src/api/memory';
import createPlanRepository from '@/src/api/planRepository';
import createUserRepository from '@/src/api/userRepository';
import Card from '@/src/components/card';
import { getColor } from '@/types/color.type';
import { CreateUser, createUserSchema, User } from '@/types/user.type';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  Text,
  View
} from 'react-native';
import { Button } from '../components/button';
import GradientView from '../components/gradient-view';
import Icon from '../components/icon';
import Input from '../components/input';
import KeyboardableView from '../components/keyboardable-view';
import Label from '../components/label';
import { useAuth } from '../context/auth';
import useNavigation from '../hooks/useNavigation';
import { checkIfIsValidAndToast } from '../utils/toastUtils';



export default function CreateUserScreen() {
  const { isSignedIn, signOut, authUser } = useAuth();
  const navigation = useNavigation();
  const userRepository = createUserRepository();
  const planRepository = createPlanRepository();

  const [user, setUser] = useState<CreateUser | null>(null);

  useEffect(() => {
    if (!isSignedIn || !authUser)
      return;

    const fetchUser = async () => {
      const dbUser = await userRepository.get({ email: authUser.email }).catch(() => {
        setUser({
          email: authUser.email,
          name: authUser.name ?? '',
          nickname: authUser.name ?? '',
          photo: authUser.photo ?? '',
          phoneNumber: '',
          pixKey: authUser.email,
        });

        return;
      });

      if (!dbUser) {
        setUser({
          email: authUser.email,
          name: authUser.name ?? '',
          nickname: authUser.name ?? '',
          photo: authUser.photo ?? '',
          phoneNumber: '',
          pixKey: authUser.email,
        });

        return;
      }
    };

    fetchUser();
  }, [authUser, isSignedIn, planRepository, navigation, userRepository]);

  if (!authUser || !user)
    return null;

  const onChangeHandler = (field: keyof User, value: string) => {
    setUser(prev => ({ ...prev as User, [field]: value }));
  }

  const createUser = async () => {
    //TODO: Validar campos informados...

    if(!checkIfIsValidAndToast(createUserSchema, user)){
      return;
    }

    const createdUser = await userRepository.create(user);

    await Memory.set('userId', createdUser.id);
    navigation.replace('./manage-plans');
  };

  return (
    <>
      <GradientView
        style={{
          paddingTop: Constants.statusBarHeight,
        }}
        className="flex flex-row items-center justify-between w-full">
        <Text className="pl-8 text-xl font-bold text-center text-white">
          Seja bem-vindo!
        </Text>

        <Pressable
          className="flex items-center justify-center w-20 h-20"
          onPress={() => {
            signOut();
          }}
        >
          <Icon name="log-out-outline" size={24} color="white" />
        </Pressable>
      </GradientView>

      <KeyboardableView>
        <View
          style={{
            flex: 1,
            backgroundColor: getColor("gray-e"),
          }}
          className="flex-1 w-full gap-6 px-4 py-3"
        >
          <Card className="flex flex-row items-center justify-center w-full gap-3">
            <View className="flex flex-col items-start justify-center gap-1 w-fit">
              <Image
                source={{
                  uri: user.photo,
                }}
                style={{ width: 80, height: 80, borderRadius: 9999 }}
              />
            </View>

            <View className="flex flex-col items-start justify-center flex-1 gap-1">
              <Label>Nome</Label>
              <Input
                inputType='nickname'
                value={user.name}
                onChange={(value) => {
                  onChangeHandler('name', value);
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
            <Label>Chave Pix</Label>
            <Input
              inputType='pix-key'
              value={user.pixKey}
              onChange={(value) => {
                onChangeHandler('pixKey', value);
              }}
            />
          </Card>

          <Button
            className='p-0 overflow-hidden'
            action={createUser}>
            <GradientView
              className="flex flex-col items-center justify-center w-full h-full">
              <Text style={{ color: getColor('white') }} className='text-lg font-bold'>Salvar</Text>
            </GradientView>
          </Button>
        </View>
      </KeyboardableView>
    </>
  );
}