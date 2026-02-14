import React from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';

export function LoginPage() {
  return (
    <View className="flex-1 bg-slate-100 px-6 justify-center">
      {/* Título */}
      <View className="items-center mb-8">
        <Text className="text-2xl font-bold text-gray-800">Login</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Entre para acompanhar seus planos e hábitos
        </Text>
      </View>

      {/* Login com Google */}
      <Pressable
        className="flex-row items-center justify-center bg-white rounded-lg py-3 px-4 shadow-sm mb-6 active:opacity-80"
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

      {/* Nickname */}
      <View className="mb-4">
        <Text className="text-xs font-semibold text-gray-600 mb-1">
          Nickname
        </Text>
        <TextInput
          placeholder="Como você quer aparecer no ranking?"
          className="w-full bg-white rounded-lg px-3 py-2 text-sm text-gray-800 border border-slate-200"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Foto */}
      <View className="mb-4">
        <Text className="text-xs font-semibold text-gray-600 mb-1">Foto</Text>
        <View className="flex-row items-center">
          <View className="w-14 h-14 rounded-full bg-slate-300 mr-3 overflow-hidden items-center justify-center">
            {/* Preview mockada da foto do usuário */}
            <Text className="text-xs text-slate-700">Foto</Text>
          </View>
          <Pressable
            className="px-3 py-2 bg-slate-800 rounded-lg active:opacity-80"
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
        <Text className="text-xs font-semibold text-gray-600 mb-1">
          Chave Pix
        </Text>
        <TextInput
          placeholder="Seu e-mail, CPF, telefone ou chave aleatória"
          className="w-full bg-white rounded-lg px-3 py-2 text-sm text-gray-800 border border-slate-200"
          placeholderTextColor="#9CA3AF"
        />
        <Text className="text-[11px] text-gray-500 mt-1">
          Usada para testes de multa (Pix de teste e estorno automático).
        </Text>
      </View>

      {/* Botão principal de continuar */}
      <Pressable
        className="w-full bg-blue-600 py-3 rounded-lg items-center justify-center active:opacity-80"
        onPress={() => {
          // TODO: salvar dados e continuar para Home
        }}
      >
        <Text className="text-sm font-semibold text-white">Continuar</Text>
      </Pressable>
    </View>
  );
}
