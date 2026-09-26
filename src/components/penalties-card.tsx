import { Penalty } from '@/types/penalty.type';
import { getColor } from '@/types/color.type';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { getDateToFront } from '../utils/dateUtils';
import { formatMoney } from '../utils/numberUtils';
import { Button } from './button';
import Icon from './icon';

type PenaltiesCardProps = {
  penalties: Penalty[];
  loading?: boolean;
  userNamesById?: Record<string, string>;
  canConfirmPayment?: boolean;
  onPayPenalty?: (penaltyId: string) => void;
  payingPenaltyId?: string | null;
};

export default function PenaltiesCard({
  penalties,
  loading = false,
  userNamesById = {},
  canConfirmPayment = false,
  onPayPenalty,
  payingPenaltyId = null,
}: PenaltiesCardProps) {
  const pendingPenalties = penalties.filter((p) => p.status === 'Pending');

  if (loading) {
    return (
      <View className="flex justify-center items-center w-full py-6">
        <ActivityIndicator size="small" color={getColor('violet')} />
      </View>
    );
  }

  if (pendingPenalties.length === 0)
    return null;

  return (
    <View
      style={{ borderColor: getColor('danger') }}
      className="flex flex-col w-full gap-3 p-4 border shadow-md rounded-xl bg-white"
    >
      <View className="flex flex-row items-center gap-2">
        <Icon type="font-awesome-6" name="triangle-exclamation" size={18} color="danger" />
        <Text style={{ color: getColor('danger') }} className="text-base font-semibold">
          Multas pendentes
        </Text>
      </View>

      {pendingPenalties.map((penalty) => {
        const memberName = userNamesById[penalty.userId] ?? 'Membro';
        const isPaying = payingPenaltyId === penalty.id;

        return (
          <View
            key={penalty.id}
            className="flex flex-row items-center justify-between gap-3 py-2 border-t border-gray-200"
          >
            <View className="flex-1">
              <Text style={{ color: getColor('black') }} className="text-sm font-semibold">
                {memberName}
              </Text>
              <Text style={{ color: getColor('gray-7') }} className="text-xs">
                {getDateToFront(penalty.date)} · {formatMoney(penalty.amount)}
              </Text>
            </View>
            {canConfirmPayment && onPayPenalty && (
              <Button
                color="success"
                textSize="text-sm"
                className="h-auto px-3 py-2 rounded-xl"
                disabled={isPaying}
                action={() => onPayPenalty(penalty.id)}
              >
                {isPaying ? '...' : 'Confirmar pagamento'}
              </Button>
            )}
          </View>
        );
      })}

      {!canConfirmPayment && (
        <Text style={{ color: getColor('gray-7') }} className="text-xs">
          Entre em contato com o dono do plano para confirmar o pagamento.
        </Text>
      )}
    </View>
  );
}
