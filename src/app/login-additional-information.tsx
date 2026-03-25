import Card from '@/src/components/card';
import { getColor } from '@/types/color.type';
import { User } from '@/types/user.type';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';
import { Button } from '../components/button';
import Input from '../components/input';
import Label from '../components/label';
import { useAuth } from '../context/auth';
import createAsyncStorageRepository from './api/repositories/asyncStorageRepository';
import createPlanRepository from './api/repositories/planRepository';
import createUserRepository from './api/repositories/userRepository';

const statusBarHeight = Constants.statusBarHeight;

export default function LoginAdditionalInformationScreen() {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const userRepository = createUserRepository();
  const planRepository = createPlanRepository();
  const asyncStorageRepository = createAsyncStorageRepository();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {

    const fetchUser = async () => {
      //const dbUser = null;
      const dbUser = await userRepository.getById('ad50726d466b4f59937f210c5344188d');

      console.log(dbUser);
      if (!dbUser) {
        setUser({
          id: '123',
          email: authUser?.email ?? 'a@b.com',
          name: authUser?.name ?? 'Test Name',
          nickname: authUser?.name ?? 'Test Nickname',
          photo: authUser?.picture ?? '...',
          phoneNumber: '11987654321',
          pixKey: authUser?.email ?? '11987654321',
        });

        return;
      }

      const plans = await planRepository.listByUserId(dbUser.id);
      const lastAccessedPlanId = await asyncStorageRepository.get<string>("planId");

      if (lastAccessedPlanId && plans.find(plan => plan.id === lastAccessedPlanId)) {
        router.replace('./plan-tracker'); // TODO Add planId to localStorage or something like this
        return;
      }

      await asyncStorageRepository.remove("planId");
      router.replace('./manage-plans')

    };

    fetchUser();


  }, [authUser, router]);

  if (!user)
    return null;

  return (
    <View
      className="flex-1"
      style={{ marginTop: statusBarHeight, backgroundColor: getColor("gray-e") }}
    >
      <ScrollView
        style={{ flex: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }} // Espaço pro botão
      >
        <LinearGradient
          colors={[getColor("violet"), getColor("purple")]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          className="flex flex-col items-center justify-center w-full"
        >
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
        </LinearGradient>

        <View className="w-full gap-6 px-4 py-3">
          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Foto</Label>
            <Input
              placeholder="..."
              value={user.photo}
              onChange={(value) => {
                setUser(prev => ({ ...prev as User, photo: value }));
              }}
            />
          </Card>

          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>E-mail</Label>
            <Input
              placeholder="..."
              value={user.email}
              onChange={(value) => {
                setUser(prev => ({ ...prev as User, email: value }));
              }}
            />
          </Card>
          
          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Apelido</Label>
            <Input
              placeholder="Como as pessoas te chamam?"
              value={user.name}
              onChange={(value) => {
                setUser(prev => ({ ...prev as User, name: value }));
              }}
            />
          </Card>
          
          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Celular</Label>
            <Input
              placeholder="...."
              value={user.phoneNumber}
              onChange={(value) => {
                setUser(prev => ({ ...prev as User, phoneNumber: value }));
              }}
            />
          </Card>
          
          <Card className="flex flex-col items-start justify-center w-full gap-1">
            <Label>Chave Pix</Label>
            <Input
              placeholder="....."
              value={user.pixKey}
              onChange={(value) => {
                setUser(prev => ({ ...prev as User, pixKey: value }));
              }}
            />
          </Card>

          <Button className='p-0 overflow-hidden'>
            <LinearGradient
              colors={[getColor("violet"), getColor("purple")]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              className="flex flex-col items-center justify-center w-full h-full">
              <Text style={{ color: getColor('white') }} className='text-lg font-bold'>Cadastrar</Text>
            </LinearGradient>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}