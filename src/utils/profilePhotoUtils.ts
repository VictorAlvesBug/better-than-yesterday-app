import createS3Repository from '@/src/api/s3Repository';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export type ProfilePhotoPickResult = {
  localUri: string;
};

async function ensureCameraPermission(): Promise<boolean> {
  const current = await ImagePicker.getCameraPermissionsAsync();
  if (current.granted) return true;

  const requested = await ImagePicker.requestCameraPermissionsAsync();
  return requested.granted;
}

async function ensureLibraryPermission(): Promise<boolean> {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) return true;

  const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return requested.granted;
}

async function pickFromCamera(): Promise<ProfilePhotoPickResult | null> {
  const granted = await ensureCameraPermission();
  if (!granted) {
    Alert.alert('Permissão necessária', 'Permita o acesso à câmera para tirar uma foto.');
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    cameraType: ImagePicker.CameraType.front,
    mediaTypes: ['images'],
    quality: 1,
    allowsEditing: true,
    aspect: [1, 1],
  });

  if (result.canceled || !result.assets?.[0]?.uri) return null;
  return { localUri: result.assets[0].uri };
}

async function pickFromGallery(): Promise<ProfilePhotoPickResult | null> {
  const granted = await ensureLibraryPermission();
  if (!granted) {
    Alert.alert('Permissão necessária', 'Permita o acesso à galeria para escolher uma foto.');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
    allowsEditing: true,
    aspect: [1, 1],
  });

  if (result.canceled || !result.assets?.[0]?.uri) return null;
  return { localUri: result.assets[0].uri };
}

export function promptProfilePhotoPicker(
  onPicked: (result: ProfilePhotoPickResult) => void,
): void {
  Alert.alert(
    'Foto de perfil',
    'Como deseja adicionar a foto?',
    [
      {
        text: 'Tirar foto',
        onPress: async () => {
          const picked = await pickFromCamera();
          if (picked) onPicked(picked);
        },
      },
      {
        text: 'Escolher da galeria',
        onPress: async () => {
          const picked = await pickFromGallery();
          if (picked) onPicked(picked);
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ],
  );
}

export async function uploadProfilePhoto(
  localUri: string,
  keyPrefix: string,
): Promise<string> {
  const s3Repository = createS3Repository();
  const sanitizedPrefix = keyPrefix.replace(/[^a-zA-Z0-9@._-]/g, '_');
  const fileName = `users/${sanitizedPrefix}/profile-${Date.now()}.jpg`;

  return s3Repository.uploadFile({
    filePath: localUri,
    fileName,
    fileType: 'image/jpeg',
  });
}

export function isLocalImageUri(uri: string): boolean {
  return uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('/');
}
