import { getColor } from '@/types/color.type';
import { PlanEnriched } from '@/types/plan.type';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import Memory from '../api/memory';
import createPlanRepository from '../api/planRepository';
import { Button } from './button';
import Card from './card';
import Icon from './icon';
import Input from './input';
import Label from './label';
import useNavigation from '../hooks/useNavigation';
import { getDifferenceInDays } from '../utils/dateUtils';
import { formatMoney } from '../utils/numberUtils';
import { toastErrorMessage, toastSuccessMessage } from '../utils/toastUtils';

type JoinPlanModalProps = {
  visible: boolean;
  onClose: () => void;
  initialPlanId?: string;
};

const GUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function parsePlanIdFromInviteInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed)
    return null;

  const joinMatch = trimmed.match(/join\/([0-9a-f-]{36})/i);
  if (joinMatch)
    return joinMatch[1];

  const guidMatch = trimmed.match(GUID_REGEX);
  return guidMatch ? guidMatch[0] : null;
}

export default function JoinPlanModal({ visible, onClose, initialPlanId = '' }: JoinPlanModalProps) {
  const navigation = useNavigation();
  const planRepository = createPlanRepository();

  const [linkInput, setLinkInput] = useState('');
  const [plan, setPlan] = useState<PlanEnriched | null>(null);
  const [searching, setSearching] = useState(false);
  const [joining, setJoining] = useState(false);
  const [searchError, setSearchError] = useState('');

  const searchPlan = useCallback(async (planIdOverride?: string) => {
    const planId = planIdOverride ?? parsePlanIdFromInviteInput(linkInput);

    if (!planId) {
      setSearchError('Link ou ID do plano inválido');
      setPlan(null);
      return;
    }

    setSearching(true);
    setSearchError('');

    try {
      const found = await planRepository.getById(planId);
      setPlan(found);
    } catch {
      setPlan(null);
      setSearchError('Plano não encontrado');
    } finally {
      setSearching(false);
    }
  }, [linkInput, planRepository]);

  useEffect(() => {
    if (visible && initialPlanId) {
      setLinkInput(`betterthanyesterdayapp://join/${initialPlanId}`);
      searchPlan(initialPlanId);
    }
  }, [visible, initialPlanId, searchPlan]);

  const reset = () => {
    setPlan(null);
    setSearchError('');
    if (!initialPlanId)
      setLinkInput('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const joinPlan = async () => {
    if (!plan)
      return;

    const userId = await Memory.get('userId') || '';
    if (!userId) {
      toastErrorMessage('Faça login para participar');
      return;
    }

    setJoining(true);

    try {
      await planRepository.join({ planId: plan.id, userId });
      await Memory.set('planId', plan.id);
      toastSuccessMessage('Você entrou no plano!');
      handleClose();
      navigation.replace('/plan-tracker');
    } catch {
      toastErrorMessage('Não foi possível entrar no plano. Apenas planos não iniciados aceitam novos membros.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <Pressable className="flex-1" onPress={handleClose} />
        <View className="px-4 pt-4 pb-8 bg-white rounded-t-3xl" style={{ maxHeight: '85%' }}>
          <View className="flex flex-row items-center justify-between mb-4">
            <Text style={{ color: getColor('black') }} className="text-lg font-bold">
              Entrar com link de convite
            </Text>
            <Pressable onPress={handleClose}>
              <Icon name="close" size={24} color="gray-7" />
            </Pressable>
          </View>

          <Label>Cole o link ou ID do plano</Label>
          <Input
            placeholder="betterthanyesterdayapp://join/..."
            value={linkInput}
            onChange={setLinkInput}
          />

          <Button action={() => searchPlan()} className="mt-3">
            Buscar
          </Button>

          {searching && (
            <ActivityIndicator className="mt-4" color={getColor('violet')} />
          )}

          {searchError && (
            <Text style={{ color: getColor('danger') }} className="mt-3 text-sm">{searchError}</Text>
          )}

          {plan && !searching && (
            <Card className="flex flex-col gap-2 mt-4">
              <Text style={{ color: getColor('black') }} className="text-lg font-bold">
                {plan.description ?? plan.habitName}
              </Text>
              <Text style={{ color: getColor('gray-7') }} className="text-sm">
                {plan.habitName} · {7 - plan.daysOffPerWeek}x/semana
              </Text>
              <Text style={{ color: getColor('gray-7') }} className="text-sm">
                Multa: {formatMoney(plan.penaltyValue)} · {getDifferenceInDays(plan.startsAt, plan.endsAt)} dias
              </Text>
              <Text style={{ color: getColor('gray-7') }} className="text-sm">
                Status: {plan.status} · {plan.memberCount} membros
              </Text>
              <Button action={joinPlan} className="mt-2" color="success">
                {joining ? 'Entrando...' : 'Participar'}
              </Button>
            </Card>
          )}
        </View>
      </View>
    </Modal>
  );
}
