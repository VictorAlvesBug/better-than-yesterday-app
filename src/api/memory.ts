
import { AuthUser } from '@/types/user.type';
import AsyncStorage from '@react-native-async-storage/async-storage';

type StoredPairs = {
    'google_idToken' : string;
    'google_user': AuthUser;
    'planId': string;
    'userId': string;
}

type StoredKey = keyof StoredPairs;
type StoredValue<TKey extends StoredKey> = StoredPairs[TKey];

const Memory = createMemory();
export default Memory; 

function createMemory(){
    const prefix = "bty_";

    const set = async <TKey extends StoredKey>(key: TKey, value: StoredValue<TKey>): Promise<void> => {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(prefix + key, jsonValue);
        } catch (e) {
            console.error(`Erro ao salvar a chave '${key}' (${typeof value}) com valor '${value}' no AsyncStorage:`, e);
        }
    };

    const get = async <TKey extends StoredKey>(key: TKey): Promise<StoredValue<TKey> | null> => {
        try {
            const jsonValue = await AsyncStorage.getItem(prefix + key);
            return jsonValue === null 
                ? null 
                : (JSON.parse(jsonValue) satisfies StoredValue<TKey>);
        } catch (e) {
            console.error(`Erro ao recuperar a chave '${key}' do AsyncStorage:`, e);
            return null;
        }
    }

    const remove = async <TKey extends StoredKey>(key: TKey): Promise<void> => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.error(`Erro ao remover a chave '${key}' do AsyncStorage:`, e);
        }
    }

    return {
        set,
        get,
        remove,
    }
}