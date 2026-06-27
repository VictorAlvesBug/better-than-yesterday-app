import Constants from 'expo-constants';

const hostUri =
  Constants.expoConfig?.hostUri ??
  Constants.manifest2?.extra?.expoGo?.debuggerHost;

const host = hostUri?.split(':')[0];

const defaultApiUrl = host ? `http://${host}:5018/api` : 'http://localhost:5018/api';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl;
