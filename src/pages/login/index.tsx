import LoginForm from '@/src/components/LoginForm';
import { useAuth } from '@/src/context/auth';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

export function LoginPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex items-center justify-center flex-1">
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <View className="justify-center flex-1 px-6 bg-slate-100">
      {/* Título */}
      <View className="items-center mb-8">
        <Text className="text-2xl font-bold text-gray-800">Login</Text>
        <Text className="mt-1 text-sm text-gray-500">
          Entre para acompanhar seus planos e hábitos
        </Text>
      </View>

      {/* Login com Google */}
      <Pressable
        className="flex-row items-center justify-center px-4 py-3 mb-6 bg-white rounded-lg shadow-sm active:opacity-80"
        onPress={() => {
          // TODO: implementar login com Google (expo-auth-session ou google-signin)
        }}
      >
        <Image
          source={{
            uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
          }}
          className="w-5 h-5 mr-3"
        />
        <Text className="text-sm font-semibold text-gray-800">
          Continuar com Google
        </Text>
      </Pressable>

      <View className="text-sm font-semibold text-gray-800">
        <Text>User: {JSON.stringify(user, null, 2)}</Text>
      </View>

      {/* Nickname */}
      <View className="mb-4">
        <Text className="mb-1 text-xs font-semibold text-gray-600">
          Nickname
        </Text>
        <TextInput
          placeholder="Como você quer aparecer no ranking?"
          className="w-full px-3 py-2 text-sm text-gray-800 bg-white border rounded-lg border-slate-200"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Foto */}
      <View className="mb-4">
        <Text className="mb-1 text-xs font-semibold text-gray-600">Foto</Text>
        <View className="flex-row items-center">
          <View className="items-center justify-center mr-3 overflow-hidden rounded-full w-14 h-14 bg-slate-300">
            {/* Preview mockada da foto do usuário */}
            <Text className="text-xs text-slate-700">Foto</Text>
          </View>
          <Pressable
            className="px-3 py-2 rounded-lg bg-slate-800 active:opacity-80"
            onPress={() => {
              // TODO: abrir galeria / câmera
            }}
          >
            <Text className="text-xs font-semibold text-white">
              Escolher foto
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Chave Pix */}
      <View className="mb-4">
        <Text className="mb-1 text-xs font-semibold text-gray-600">
          Chave Pix
        </Text>
        <TextInput
          placeholder="Seu e-mail, CPF, telefone ou chave aleatória"
          className="w-full px-3 py-2 text-sm text-gray-800 bg-white border rounded-lg border-slate-200"
          placeholderTextColor="#9CA3AF"
        />
        <Text className="text-[11px] text-gray-500 mt-1">
          Usada para testes de multa (Pix de teste e estorno automático).
        </Text>
      </View>

      {/* Botão principal de continuar */}
      <Pressable
        className="items-center justify-center w-full py-3 bg-blue-600 rounded-lg active:opacity-80"
        onPress={() => {
          // TODO: salvar dados e continuar para Home
        }}
      >
        <Text className="text-sm font-semibold text-white">Continuar</Text>
      </Pressable>
    </View>
  );
}
