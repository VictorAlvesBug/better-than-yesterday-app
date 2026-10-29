import { getColor } from '@/types/color.type';
import { ChallengeEnriched } from '@/types/challenge.type';
import { Image, Modal, Text, View } from 'react-native';
import useNavigation from '../hooks/useNavigation';
import { duplicateChallengePath } from '../utils/challengeUtils';
import { formatDateRelativeToToday, getDateToFront, getDifferenceInDays } from '../utils/dateUtils';
import { formatIntegerCompact, formatMoney } from '../utils/numberUtils';
import { Button } from './button';
import ModalCloseButton from './modal-close-button';

type ChallengeDetailsModalProps = {
  challenge: ChallengeEnriched | null;
  onClose: () => void;
};

export default function ChallengeDetailsModal({ challenge, onClose }: ChallengeDetailsModalProps) {
  const navigation = useNavigation();
  return (
    <Modal visible={challenge !== null} animationType="fade" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        {challenge && (
          <View className="relative w-full px-4 pt-4 pb-6 bg-white rounded-3xl">
            <ModalCloseButton onPress={onClose} />
            <Text style={{ color: getColor('black') }} className="pr-10 text-lg font-bold">
              {challenge.habitName}
            </Text>
            {challenge.coverPhotoUrl ? (
              <Image source={{ uri: challenge.coverPhotoUrl }} style={{ width: '100%', height: 140, borderRadius: 12, marginTop: 12 }} />
            ) : null}
            <Text style={{ color: getColor('gray-3') }} className="mt-1 text-sm">
              {challenge.ownerName}
            </Text>
            {challenge.description ? (
              <Text style={{ color: getColor('black') }} className="mt-3 text-base">
                {challenge.description}
              </Text>
            ) : null}
            <Text style={{ color: getColor('gray-3') }} className="mt-3 text-sm">
              {`Início ${getDateToFront(challenge.startsAt)} (${formatDateRelativeToToday(challenge.startsAt).toLowerCase()})`}
            </Text>
            <Text style={{ color: getColor('gray-3') }} className="mt-1 text-sm">
              {`Término ${getDateToFront(challenge.endsAt)} · ${getDifferenceInDays(challenge.startsAt, challenge.endsAt)} dias de duração`}
            </Text>
            <Text style={{ color: getColor('gray-3') }} className="mt-1 text-sm">
              {`Multa ${formatMoney(challenge.penaltyValue)} · ${7 - challenge.daysOffPerWeek}/7 · ${formatIntegerCompact(challenge.memberCount)} jogadores`}
            </Text>
            <Button
              action={() => {
                onClose();
                navigation.push(duplicateChallengePath(challenge));
              }}
              className="mt-4"
            >
              Repetir desafio
            </Button>
          </View>
        )}
      </View>
    </Modal>
  );
}
