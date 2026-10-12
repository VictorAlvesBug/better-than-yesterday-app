import { getColor } from '@/types/color.type';
import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { toastSuccessMessage } from '../utils/toastUtils';
import { Button } from './button';
import Icon from './icon';

type InviteLinkModalProps = {
  visible: boolean;
  planId: string;
  onClose: () => void;
};

export default function InviteLinkModal({ visible, planId, onClose }: InviteLinkModalProps) {
  // TODO: Criar link acessável via navegador
  const link = `betterthanyesterdayapp://join/${planId}`;

  const copy = () => {
    Clipboard.setString(link);
    toastSuccessMessage('Link copiado');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        <View className="relative w-full px-4 pt-4 pb-6 bg-white rounded-3xl">
          <Pressable onPress={onClose} className="absolute z-10 items-center justify-center w-8 h-8 top-4 right-4">
            <Icon name="close" size={24} color="gray-3" />
          </Pressable>
          <Text style={{ color: getColor('black') }} className="pr-8 text-lg font-bold">
            Convite do plano
          </Text>
          <Text style={{ color: getColor('gray-3') }} className="mt-3 text-sm">
            {link}
          </Text>
          <Button action={copy} className="mt-4">
            Copiar link
          </Button>
        </View>
      </View>
    </Modal>
  );
}
