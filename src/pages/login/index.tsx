import LoginForm from '@/src/components/LoginForm';
import { useAuth } from '@/src/context/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

export function LoginPage() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter(); // ← ADICIONE ISTO
  const [name, setName] = useState(user?.name ?? '');
  const [pixKey, setPixKey] = useState(user?.email ?? '');

  if (isLoading) {
    return (
      <View className="items-center justify-center flex-1">
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <View className="justify-center flex-1 px-6 bg-slate-100">
      {/* Bem-vindo + alterar conta */}
      <View className="mb-6">
        <Text className="text-xl font-bold text-gray-800">
          Bem-vindo, {user.name ?? 'participante'} 👋
        </Text>
        <Text className="mt-1 text-sm text-gray-500">
          Confirme seus dados para entrar e gerenciar seus planos.
        </Text>

        <Pressable
          className="self-start px-3 py-1 mt-3 border rounded-full border-slate-300 active:opacity-80"
          onPress={async () => {
            await signOut?.();
          }}
        >
          <Text className="text-xs font-semibold text-slate-700">
            Alterar conta
          </Text>
        </Pressable>
      </View>

      {/* Form de nome */}
      <View className="mb-4">
        <Text className="mb-1 text-xs font-semibold text-gray-600">Nome</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Como você quer aparecer no ranking?"
          className="w-full px-3 py-2 text-sm text-gray-800 bg-white border rounded-lg border-slate-200"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Chave Pix (pré-preenchida com e-mail) */}
      <View className="mb-4">
        <Text className="mb-1 text-xs font-semibold text-gray-600">
          Chave Pix
        </Text>
        <TextInput
          value={pixKey}
          onChangeText={setPixKey}
          placeholder="Seu e-mail, CPF, telefone ou chave aleatória"
          className="w-full px-3 py-2 text-sm text-gray-800 bg-white border rounded-lg border-slate-200"
          placeholderTextColor="#9CA3AF"
        />
        <Text className="text-[11px] text-gray-500 mt-1">
          Usada para testes de multa (Pix de teste e estorno automático).
        </Text>
      </View>

      {/* Botão Entrar → manage-plans */}
      <Pressable
        className="items-center justify-center w-full py-3 bg-blue-600 rounded-lg active:opacity-80"
        onPress={() => {
          // Aqui você pode salvar name/pixKey em contexto/API antes se quiser
          router.replace('/(app)/manage-plans'); // ← ADICIONE ISTO
        }}
      >
        <Text className="text-sm font-semibold text-white">Entrar</Text>
      </Pressable>
    </View>
  );
}
