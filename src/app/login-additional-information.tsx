import Card from '@/src/components/card';
import { getColor } from '@/types/color.type';
import { User } from '@/types/user.type';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  Text,
  View
} from 'react-native';
import { Button } from '../components/button';
import GradientView from '../components/gradient-view';
import Input from '../components/input';
import KeyboardableView from '../components/keyboardable-view';
import Label from '../components/label';
import { useAuth } from '../context/auth';
import Memory from './api/repositories/memory';
import createPlanRepository from './api/repositories/planRepository';
import createUserRepository from './api/repositories/userRepository';



export default function LoginAdditionalInformationScreen() {
  const { isSignedIn, signOut, authUser } = useAuth();
  const router = useRouter();
  const userRepository = createUserRepository();
  const planRepository = createPlanRepository();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isSignedIn || !authUser)
      return;

    const fetchUser = async () => {
      const dbUser = await userRepository.getByEmail(authUser.email);

      if (!dbUser) {
        setUser({
          id: authUser.id,
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
  }, [authUser, isSignedIn, planRepository, router, userRepository]);

  if (!authUser || !user)
    return null;

  const onChangeHandler = (field: keyof User, value: string) => {
    setUser(prev => ({ ...prev as User, [field]: value }));
  }

  const createUser = async () => {
    //TODO: Validar campos informados...

    const result = await userRepository.save(user);
    console.log(result);

    await Memory.set('userId', user.id);
    router.replace('./manage-plans');
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
          <Ionicons name="log-out-outline" size={24} color="#fff" />
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