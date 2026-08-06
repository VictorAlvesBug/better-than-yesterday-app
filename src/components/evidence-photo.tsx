import { getColor } from '@/types/color.type';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Icon from './icon';

const API_DEBUG = process.env.EXPO_PUBLIC_API_DEBUG === 'true';

export function isValidRemoteImageUrl(url?: string | null): url is string {
  if (!url)
    return false;

  const trimmed = url.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

type EvidencePhotoProps = {
  uri?: string | null;
};

export default function EvidencePhoto({ uri }: EvidencePhotoProps) {
  const [hasError, setHasError] = useState(false);
  const normalizedUri = uri?.trim() ?? '';
  const shouldLoadImage = isValidRemoteImageUrl(normalizedUri) && !hasError;

  useEffect(() => {
    setHasError(false);
  }, [normalizedUri]);

  if (!shouldLoadImage) {
    return <EvidencePhotoPlaceholder />;
  }

  return (
    <Image
      source={{ uri: normalizedUri }}
      style={{
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: getColor('gray-d'),
      }}
      contentFit="cover"
      cachePolicy="memory-disk"
      recyclingKey={normalizedUri}
      onError={() => {
        if (API_DEBUG)
          console.warn('[EvidencePhoto] failed to load:', normalizedUri);

        setHasError(true);
      }}
    />
  );
}

function EvidencePhotoPlaceholder() {
  return (
    <View
      style={{
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: getColor('gray-d'),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name="image-outline" size={32} color="gray-6" />
    </View>
  );
}
