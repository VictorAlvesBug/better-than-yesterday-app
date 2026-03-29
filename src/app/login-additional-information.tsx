import Card from '@/src/components/card';
import { getColor } from '@/types/color.type';
import { AuthUser, User } from '@/types/user.type';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  Text,
  View
} from 'react-native';
import { Button } from '../components/button';
import GradientHeader from '../components/gradient-header';
import Input from '../components/input';
import KeyboardableView from '../components/keyboardable-view';
import Label from '../components/label';
import Memory from './api/repositories/memory';
import createPlanRepository from './api/repositories/planRepository';
import createUserRepository from './api/repositories/userRepository';



export default function LoginAdditionalInformationScreen() {
  //const { user: authUser } = useAuth();
  const router = useRouter();
  const userRepository = createUserRepository();
  const planRepository = createPlanRepository();

  const [user, setUser] = useState<User | null>(null);

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const fetchAuthUser = async () => {
      //Memory.get<string>("google.idToken", idToken || "");
      setAuthUser(await Memory.get("google_user"));
    };

    fetchAuthUser();
  }, [])

  useEffect(() => {

    const fetchUser = async () => {
      if (!authUser)
        return;

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

      await Memory.set('userId', dbUser.id);

      const plans = await planRepository.listByUserId(dbUser.id);
      const lastAccessedPlanId = await Memory.get('planId');

      if (lastAccessedPlanId && plans.some(plan => plan.id === lastAccessedPlanId)) {
        router.replace('./plan-tracker');
        return;
      }

      await Memory.remove('planId');
      router.replace('./manage-plans');
    };

    fetchUser();
  }, [authUser, planRepository, router, userRepository]);

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
      <GradientHeader>
        <View className="flex flex-row items-center justify-between w-full">
          <View className="flex flex-col items-center justify-center pl-8">
            <Text className="text-xl font-bold text-center text-white">
              Seja bem-vindo!
            </Text>
          </View>

          <Pressable
            className="flex items-center justify-center w-20 h-20"
            onPress={() => router.replace('/login')}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </Pressable>
        </View>
      </GradientHeader>

      <KeyboardableView>
        <View
          className="flex-1"
          style={{
            flex: 1,
            backgroundColor: getColor("gray-e"),
          }}
        >


          <View className="w-full gap-6 px-4 py-3">
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
                disabled
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
              <LinearGradient
                colors={[getColor("violet"), getColor("purple-violet"), getColor("purple")]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                className="flex flex-col items-center justify-center w-full h-full">
                <Text style={{ color: getColor('white') }} className='text-lg font-bold'>Salvar</Text>
              </LinearGradient>
            </Button>
          </View>
        </View>
      </KeyboardableView>
    </>
  );
}