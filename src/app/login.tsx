import { getColor } from '@/types/color.type';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from "@react-native-google-signin/google-signin";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { formatIntegerCompact, formatMoneyCompact } from '../utils/numberUtils';
import Memory from './api/repositories/memory';

export default function LoginScreen() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();
  //const { signIn } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)){
        const { idToken, user } = response.data;
        idToken && Memory.set("google_idToken", idToken);
        Memory.set("google_user", user);
        router.replace('/login-additional-information')
      }
      else{
        console.log("Login com Google foi cancelado")
      }

      setIsSubmitting(false);
    } catch (error) {
      if (isErrorWithCode(error)){
        switch (error.code){
          case statusCodes.IN_PROGRESS:
        console.log("Login com Google está em progresso");
        break;

        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          console.log("Play Services não está disponível");
          break;
          
          default:
            console.log(error.code);
        }
      }
      else {
        console.log("Ops, ocorreu um erro");
      }

      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={[getColor("violet"), getColor("purple-violet"), getColor("purple")]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      className="flex items-center justify-center flex-1"
    >
      <View className="flex items-center justify-center flex-1 w-[90%] max-w-[450px]">
        <Image
          source={require("../../assets/images/logo.png")}
          resizeMode="cover"
          className="mb-8 rounded-full w-28 h-28"
        />
        <Text className="px-8 mb-2 text-5xl font-extrabold text-white">BTY</Text>
        <Text className="px-8 mb-2 text-lg font-semibold text-white">
          Better Than Yesterday
        </Text>
        <View className="flex flex-row items-center justify-center gap-2 px-8 mb-12">
          <Ionicons name="trending-up-outline" size={18} color={getColor("gold")} />
          <Text className="text-sm font-thin text-white">
            Construa hábitos. Ganhe recompensas.
          </Text>
        </View>
        <Pressable
          className="w-full mb-6"
          // onPress={() => router.replace('/login-additional-information')}
          onPress={handleGoogleSignIn}
          disabled={isSubmitting}
        >
          <View className="flex flex-row items-center justify-center gap-3 py-4 bg-white rounded-xl">
            <Image
              source={{
                uri: 'https://developers.google.com/identity/images/g-logo.png',
              }}
              style={{ width: 24, height: 24 }}
            />
            <Text className="text-lg font-semibold text-black">
              Continuar com Google
            </Text>
          </View>
        </Pressable>
        <Text className="px-8 mb-12 text-xs font-thin text-center text-white">
          Ao continuar, você concorda com nossos Termos de Uso e Política de
          Privacidade.
        </Text>
        <View className="flex flex-row items-center justify-between w-full px-4">
          <View className="flex flex-col items-center justify-center flex-1 gap-1 rounded-full">
            <Text className="text-2xl font-bold text-white">
              {formatIntegerCompact(5_000) + '+'}
            </Text>
            <Text className="text-sm font-thin text-white">Usuários</Text>
          </View>
          <View className="flex flex-col items-center justify-center flex-1 gap-1 rounded-full">
            <Text className="text-2xl font-bold text-white">
              {formatIntegerCompact(10_000) + '+'}
            </Text>
            <Text className="text-sm font-thin text-white">Hábitos</Text>
          </View>
          <View className="flex flex-col items-center justify-center flex-1 gap-1 rounded-full">
            <Text className="text-2xl font-bold text-white">
              {formatMoneyCompact(50_000) + '+'}
            </Text>
            <Text className="text-sm font-thin text-white">Distribuídos</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
