import { getColor } from '@/types/color.type';
import { ChallengeEnriched } from '@/types/challenge.type';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Memory from '../api/memory';
import createChallengeRepository from '../api/challengeRepository';
import { Button } from './button';
import Card from './card';
import Icon from './icon';
import Input from './input';
import Label from './label';
import useNavigation from '../hooks/useNavigation';
import { getDifferenceInDays } from '../utils/dateUtils';
import { formatMoney } from '../utils/numberUtils';
import { duplicateChallengePath } from '../utils/challengeUtils';
import { toastErrorMessage, toastSuccessMessage } from '../utils/toastUtils';

type JoinChallengeModalProps = {
  visible: boolean;
  onClose: () => void;
  initialChallengeId?: string;
};

const GUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function parseChallengeIdFromInviteInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed)
    return null;

  const joinMatch = trimmed.match(/join\/([0-9a-f-]{36})/i);
  if (joinMatch)
    return joinMatch[1];

  const guidMatch = trimmed.match(GUID_REGEX);
  return guidMatch ? guidMatch[0] : null;
}

export default function JoinChallengeModal({ visible, onClose, initialChallengeId = '' }: JoinChallengeModalProps) {
  const navigation = useNavigation();
  const challengeRepository = useMemo(() => createChallengeRepository(), []);

  const [linkInput, setLinkInput] = useState('');
  const [challenge, setChallenge] = useState<ChallengeEnriched | null>(null);
  const [searching, setSearching] = useState(false);
  const [joining, setJoining] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onKeyboardShow = (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height);
    };

    const onKeyboardHide = () => {
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible)
      setKeyboardHeight(0);
  }, [visible]);

  const searchChallenge = useCallback(async (challengeIdOverride?: string) => {
    const challengeId = challengeIdOverride ?? parseChallengeIdFromInviteInput(linkInput);

    if (!challengeId) {
      setSearchError('Esse convite não abre nenhum desafio');
      setChallenge(null);
      return;
    }

    setSearching(true);
    setSearchError('');

    try {
      const found = await challengeRepository.getById(challengeId);
      setChallenge(found);
    } catch {
      setChallenge(null);
      setSearchError('Esse desafio sumiu do mapa');
    } finally {
      setSearching(false);
    }
  }, [linkInput, challengeRepository]);

  useEffect(() => {
    if (visible && initialChallengeId) {
      setLinkInput(`betterthanyesterdayapp://join/${initialChallengeId}`);
      searchChallenge(initialChallengeId);
    }
  }, [visible, initialChallengeId, searchChallenge]);

  const reset = () => {
    setChallenge(null);
    setSearchError('');
    if (!initialChallengeId)
      setLinkInput('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const joinChallenge = async () => {
    if (!challenge)
      return;

    const userId = await Memory.get('userId') || '';
    if (!userId) {
      toastErrorMessage('Entra na conta para jogar');
      return;
    }

    setJoining(true);

    try {
      await challengeRepository.join({ challengeId: challenge.id, userId });
      await Memory.set('challengeId', challenge.id);
      toastSuccessMessage('Você entrou no desafio. Bora!');
      handleClose();
      navigation.replace('/challenge-tracker');
    } catch {
      toastErrorMessage('Não deu para entrar. Só desafio que ainda não começou aceita jogador novo.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingBottom: keyboardHeight,
          }}
        >
          <View
            className="relative w-full px-4 pt-4 pb-6 bg-white rounded-3xl"
            style={{ maxHeight: '85%' }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="flex flex-row items-start justify-between mb-4">
                <Text
                  style={{ color: getColor('black') }}
                  className="flex-1 pr-3 text-lg font-bold"
                >
                  Entrar com convite
                </Text>
                <Pressable
                  onPress={handleClose}
                  hitSlop={10}
                  className="items-center justify-center w-8 h-8"
                >
                  <Icon name="close" size={24} color="gray-3" />
                </Pressable>
              </View>

              <Label>Cola o convite ou o ID do desafio</Label>
              <Input
                placeholder="betterthanyesterdayapp://join/..."
                value={linkInput}
                onChange={setLinkInput}
              />

              <Button action={() => searchChallenge()} className="mt-3">
                Buscar
              </Button>

              {searching && (
                <ActivityIndicator className="mt-4" color={getColor('violet')} />
              )}

              {searchError && (
                <Text style={{ color: getColor('danger') }} className="mt-3 text-sm">{searchError}</Text>
              )}

              {challenge && !searching && (
                <Card className="flex flex-col gap-2 mt-4">
                  {challenge.coverPhotoUrl ? (
                    <Image source={{ uri: challenge.coverPhotoUrl }} style={{ width: '100%', height: 140, borderRadius: 12 }} />
                  ) : null}
                  <Text style={{ color: getColor('black') }} className="text-lg font-bold">
                    {challenge.description ?? challenge.habitName}
                  </Text>
                  <Text style={{ color: getColor('gray-3') }} className="text-sm">
                    {challenge.habitName} · {7 - challenge.daysOffPerWeek}x/semana
                  </Text>
                  <Text style={{ color: getColor('gray-3') }} className="text-sm">
                    Multa: {formatMoney(challenge.penaltyValue)} · {getDifferenceInDays(challenge.startsAt, challenge.endsAt)} dias
                  </Text>
                  <Text style={{ color: getColor('gray-3') }} className="text-sm">
                    Status: {challenge.status} · {challenge.memberCount} jogadores
                  </Text>
                  <Button action={joinChallenge} className="mt-2" color="success">
                    {joining ? 'Entrando...' : 'Participar'}
                  </Button>
                  <Button
                    action={() => {
                      onClose();
                      navigation.push(duplicateChallengePath(challenge));
                    }}
                    type="outline"
                  >
                    Repetir desafio
                  </Button>
                </Card>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}
