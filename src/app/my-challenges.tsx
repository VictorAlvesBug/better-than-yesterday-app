import { getColor } from '@/types/color.type';
import { ChallengeEnriched, ChallengeStatus } from '@/types/challenge.type';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import Memory from '../api/memory';
import { Button } from '../components/button';
import ModalCloseButton from '../components/modal-close-button';
import DateRangeSelect from '../components/date-range-select';
import ScreenHeader from '../components/screen-header';
import ScreenLayout from '../components/screen-layout';
import { useRepositories } from '../hooks/useRepositories';
import useNavigation from '../hooks/useNavigation';
import { DateOnly, getDateOnly, getDateOnlyWithOffset, getDateToFront } from '../utils/dateUtils';
import { commitmentLabel, duplicateChallengePath, elapsedPercent, penaltyScale } from '../utils/challengeUtils';
import { toastErrorMessage, toastSuccessMessage } from '../utils/toastUtils';

const statusLabel: Record<ChallengeStatus, string> = {
  NotStarted: 'No aquecimento',
  Running: 'Em jogo',
  Finished: 'Missão cumprida',
  Cancelled: 'Arena fechada',
};

export default function MyChallengesScreen() {
  const navigation = useNavigation();
  const { challenge: challengeRepository } = useRepositories();
  const [userId, setUserId] = useState('');
  const [challenges, setChallenges] = useState<ChallengeEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState<ChallengeEnriched | null>(null);
  const [startsAt, setStartsAt] = useState<DateOnly>(getDateOnly());
  const [endsAt, setEndsAt] = useState<DateOnly>(getDateOnly());

  const load = useCallback(async () => {
    const storedUserId = await Memory.get('userId') || '';
    setUserId(storedUserId);
    if (!storedUserId) {
      setChallenges([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const owned = await challengeRepository.list({ ownerId: storedUserId });
    setChallenges(owned);
    setLoading(false);
    setRefreshing(false);
  }, [challengeRepository]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openChallenge = async (challenge: ChallengeEnriched) => {
    await Memory.set('challengeId', challenge.id);
    navigation.push('/challenge-tracker');
  };

  const postpone = async (challenge: ChallengeEnriched) => {
    try {
      await challengeRepository.updatePeriod(
        challenge.id,
        userId,
        getDateOnlyWithOffset(7, challenge.startsAt),
        getDateOnlyWithOffset(7, challenge.endsAt),
      );
      toastSuccessMessage('Desafio adiado em 7 dias');
      await load();
    } catch {
      toastErrorMessage('Não deu para adiar o desafio');
    }
  };

  const saveDates = async () => {
    if (!editing)
      return;

    const today = getDateOnly();
    if (startsAt <= today) {
      toastErrorMessage('A data de início precisa ser a partir de amanhã');
      return;
    }

    try {
      await challengeRepository.updatePeriod(editing.id, userId, startsAt, endsAt);
      toastSuccessMessage('Datas do desafio atualizadas');
      setEditing(null);
      await load();
    } catch {
      toastErrorMessage('Não deu para salvar as datas');
    }
  };

  const cancelChallenge = (challenge: ChallengeEnriched) => {
    Alert.alert('Encerrar desafio', 'As multas já pagas voltam para quem pagou.', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Encerrar',
        style: 'destructive',
        onPress: async () => {
          try {
            await challengeRepository.cancel(challenge.id);
            toastSuccessMessage('Desafio encerrado');
            await load();
          } catch {
            toastErrorMessage('Não deu para encerrar o desafio');
          }
        },
      },
    ]);
  };

  return (
    <ScreenLayout header={<ScreenHeader title="Meus desafios" />}>
      {loading ? (
        <ActivityIndicator className="mt-8" color={getColor('violet')} />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={getColor('violet')} />
          }
        >
          {challenges.length === 0 && (
            <Text style={{ color: getColor('gray-3') }} className="text-base">
              Você ainda não criou um desafio. A arena está esperando.
            </Text>
          )}
          {challenges.map((challenge) => {
            const canEdit = challenge.status === 'NotStarted';
            const today = getDateOnly();
            const tomorrow = getDateOnlyWithOffset(1);
            const missingQuorumAndStartsTomorrow = challenge.memberCount < 2 && challenge.startsAt === tomorrow;
            const percent = elapsedPercent(challenge.startsAt, challenge.endsAt, today);
            return (
              <Pressable key={challenge.id} onPress={() => openChallenge(challenge)} className="w-full gap-3 p-4 bg-white shadow-md rounded-2xl">
                <View className="flex flex-row gap-3">
                  {challenge.coverPhotoUrl ? (
                    <Image source={{ uri: challenge.coverPhotoUrl }} style={{ width: 72, height: 72, borderRadius: 12 }} />
                  ) : (
                    <View style={{ width: 72, height: 72, borderRadius: 12, backgroundColor: getColor('gray-e') }} />
                  )}
                  <View className="flex-1 gap-1">
                    <Text style={{ color: getColor('black') }} className="text-base font-semibold">
                      {challenge.description || challenge.habitName}
                    </Text>
                    <Text style={{ color: getColor('gray-3') }} className="text-sm">
                      {`${getDateToFront(challenge.startsAt)} até ${getDateToFront(challenge.endsAt)} · ${percent}%`}
                    </Text>
                    <Text style={{ color: getColor('gray-3') }} className="text-sm">
                      {`${challenge.memberCount} jogadores · ${penaltyScale(challenge.penaltyValue)} · ${commitmentLabel(challenge.daysOffPerWeek)} · ${statusLabel[challenge.status]}`}
                    </Text>
                  </View>
                </View>
                {missingQuorumAndStartsTomorrow && (
                  <Text style={{ color: getColor('dark-orange') }} className="text-sm">
                    Falta um jogador para o apito de amanhã.
                  </Text>
                )}
                <View className="gap-2">
                  {canEdit && (
                    <>
                      <Button action={() => postpone(challenge)} type="outline">Adiar 7 dias</Button>
                      <Button
                        action={() => {
                          setEditing(challenge);
                          console.log(JSON.stringify(challenge, null, 2));
                          setStartsAt(challenge.startsAt);
                          setEndsAt(challenge.endsAt);
                        }}
                        type="outline"
                      >
                        Editar datas
                      </Button>
                      <Button action={() => cancelChallenge(challenge)} color="danger" type="outline">Encerrar</Button>
                    </>
                  )}
                  <Button action={() => navigation.push(duplicateChallengePath(challenge))}>
                    Repetir desafio
                  </Button>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
      <Modal visible={editing !== null} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 }}>
          <View className="relative gap-3 p-4 bg-white rounded-3xl">
            <ModalCloseButton onPress={() => setEditing(null)} />
            <Text style={{ color: getColor('black') }} className="pr-8 text-base font-semibold">Ajustar o calendário</Text>
            <DateRangeSelect
              startValueLabel="Início"
              startValue={getDateToFront(startsAt)}
              setStartValue={(value) => setStartsAt(value.split('/').reverse().join('-') as DateOnly)}
              endValueLabel="Término"
              endValue={getDateToFront(endsAt)}
              setEndValue={(value) => setEndsAt(value.split('/').reverse().join('-') as DateOnly)}
            />
            <Button action={saveDates}>Pronto</Button>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}
