import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import GradientView from '../components/gradient-view';
import Icon from '../components/icon';
import { useAuth } from '../context/auth';
import { formatIntegerCompact, formatMoneyCompact } from '../utils/numberUtils';

export default function LoginScreen() {
  const { errorMessage, isLoading, signIn } = useAuth();
  const loggedLayout = React.useRef(false);

  return (
    <GradientView
      gradientFlowDirection="top-to-bottom"
      className="flex items-center justify-center flex-1"
      onLayout={(event) => {
        if (loggedLayout.current) return;
        loggedLayout.current = true;
        const { width, height } = event.nativeEvent.layout;
        // #region agent log
        fetch('http://127.0.0.1:7592/ingest/3ca86e35-fb03-43a9-869d-50a6c2ae00ee',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f797c0'},body:JSON.stringify({sessionId:'f797c0',runId:'post-fix',hypothesisId:'D',location:'login.tsx:onLayout',message:'login root layout',data:{width,height},timestamp:Date.now()})}).catch(()=>{});
        console.log('[debug-f797c0]', JSON.stringify({runId:'post-fix',hypothesisId:'D',message:'login root layout',width,height}));
        // #endregion
      }}
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
          <Icon name="trending-up-outline" color={"gold"} />
          <Text className="text-sm font-thin text-white">
            Construa hábitos. Ganhe recompensas.
          </Text>
        </View>
        <Pressable
          className="w-full mb-6"
          onPress={signIn}
          disabled={isLoading}
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
        {errorMessage ? (
          <Text className="px-8 mb-6 text-sm font-semibold text-center text-white">
            {errorMessage}
          </Text>
        ) : null}
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
    </GradientView>
  );
}
