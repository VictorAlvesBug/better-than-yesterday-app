import { getColor } from '@/types/color.type';
import { PlanEnriched } from '@/types/plan.type';
import { Image, Modal, Pressable, Text, View } from 'react-native';
import useNavigation from '../hooks/useNavigation';
import { duplicatePlanPath } from '../utils/planUtils';
import { formatDateRelativeToToday, getDateToFront, getDifferenceInDays } from '../utils/dateUtils';
import { formatIntegerCompact, formatMoney } from '../utils/numberUtils';
import { Button } from './button';
import Icon from './icon';

type PlanDetailsModalProps = {
  plan: PlanEnriched | null;
  onClose: () => void;
};

export default function PlanDetailsModal({ plan, onClose }: PlanDetailsModalProps) {
  const navigation = useNavigation();
  return (
    <Modal visible={plan !== null} animationType="fade" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        {plan && (
          <View className="relative w-full px-4 pt-4 pb-6 bg-white rounded-3xl">
            <Pressable onPress={onClose} className="absolute z-10 items-center justify-center w-8 h-8 top-4 right-4">
              <Icon name="close" size={22} color="gray-3" />
            </Pressable>
            <Text style={{ color: getColor('black') }} className="pr-10 text-lg font-bold">
              {plan.habitName}
            </Text>
            {plan.coverPhotoUrl ? (
              <Image source={{ uri: plan.coverPhotoUrl }} style={{ width: '100%', height: 140, borderRadius: 12, marginTop: 12 }} />
            ) : null}
            <Text style={{ color: getColor('gray-3') }} className="mt-1 text-sm">
              {plan.ownerName}
            </Text>
            {plan.description ? (
              <Text style={{ color: getColor('black') }} className="mt-3 text-base">
                {plan.description}
              </Text>
            ) : null}
            <Text style={{ color: getColor('gray-3') }} className="mt-3 text-sm">
              {`Início ${getDateToFront(plan.startsAt)} (${formatDateRelativeToToday(plan.startsAt).toLowerCase()})`}
            </Text>
            <Text style={{ color: getColor('gray-3') }} className="mt-1 text-sm">
              {`Término ${getDateToFront(plan.endsAt)} · ${getDifferenceInDays(plan.startsAt, plan.endsAt)} dias de duração`}
            </Text>
            <Text style={{ color: getColor('gray-3') }} className="mt-1 text-sm">
              {`Multa ${formatMoney(plan.penaltyValue)} · ${7 - plan.daysOffPerWeek}/7 · ${formatIntegerCompact(plan.memberCount)} membros`}
            </Text>
            <Button
              action={() => {
                onClose();
                navigation.push(duplicatePlanPath(plan));
              }}
              className="mt-4"
            >
              Duplicar
            </Button>
            <Button action={onClose} type="outline" className="mt-2">
              Fechar
            </Button>
          </View>
        )}
      </View>
    </Modal>
  );
}
