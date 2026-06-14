import Constants from 'expo-constants';

const hostUri =
  Constants.expoConfig?.hostUri ??
  Constants.manifest2?.extra?.expoGo?.debuggerHost;

const host = hostUri?.split(':')[0];

console.log('Host:', host);

export const JSON_API_URL = host ? `http://${host}:3000` : 'http://localhost:3000';
export const API_URL = host ? `http://${host}:5018/api` : 'http://localhost:5018/api';