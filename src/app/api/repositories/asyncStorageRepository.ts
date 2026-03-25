
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function createAsyncStorageRepository(){
    return {
        get: async <TValue>(key: string, defaultValue: TValue | null = null) => {
            const json = await AsyncStorage.getItem(key);
            return json ? JSON.parse(json) as TValue : defaultValue;
        },
        set: async <TValue>(key: string, value: TValue) => {
            return await AsyncStorage.setItem(key, JSON.stringify(value));
        },
        remove: async (key: string) => {
            return await AsyncStorage.removeItem(key);
        },
    }
}