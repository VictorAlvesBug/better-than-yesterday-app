import Constants from 'expo-constants';

const hostUri =
  Constants.expoConfig?.hostUri ??
  Constants.manifest2?.extra?.expoGo?.debuggerHost;

const host = hostUri?.split(':')[0];

export const API_URL = host ? `http://${host}:3000` : 'http://localhost:3000';