import { ColorName, getColor } from '@/types/color.type'
import { ChallengeToJoin } from '@/types/challenge.type'
import React, { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import createChallengeRepository from '../api/challengeRepository'
import useNavigation from '../hooks/useNavigation'
import { formatDateRelativeToToday } from '../utils/dateUtils'
import { Button } from './button'
import Icon from './icon'
import ChallengeDetailsModal from './challenge-details-modal'
import InviteLinkModal from './invite-link-modal'

type ButtonRole = 'join' | 'leave' | 'peek';

type ChallengeCardProps = {
    challenge: ChallengeToJoin;
    userId: string;
    callback?: (challengeId: string, joined: boolean) => void;
}

function ChallengeCard({
    challenge,
    userId,
    callback = () => Promise.resolve()
}: ChallengeCardProps) {
    const challengeRepository = useMemo(() => createChallengeRepository(), []);
    const navigation = useNavigation();
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);

    const role = getButtonRole(challenge);

    const buttonInfo = getButtonInfo({
        role,
        challengeId: challenge.id,
        userId,
        callback,
        challengeRepository,
        navigation,
    });

    const statusInfo = getStatusInfo(challenge.status);

    const dollarSigns = challenge.penaltyValue >= 50 ? '$$$' : challenge.penaltyValue >= 10 ? '$$' : '$';

    return (
        <View className="py-2 pb-4 mx-4">
            <ChallengeDetailsModal challenge={detailsOpen ? challenge : null} onClose={() => setDetailsOpen(false)} />
            <InviteLinkModal visible={inviteOpen} challengeId={challenge.id} onClose={() => setInviteOpen(false)} />
            <View className="flex flex-row w-full overflow-hidden bg-white shadow-md rounded-2xl">
                <View
                    style={{ backgroundColor: statusInfo.backgroundColor, width: 22 }}
                    className="items-center justify-center"
                >
                    <Text
                        style={{
                            color: statusInfo.textColor,
                            transform: [{ rotate: '-90deg' }],
                            width: 120,
                            textAlign: 'center',
                            fontWeight: '700',
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                        }}
                        numberOfLines={1}
                    >
                        {statusInfo.label}
                    </Text>
                </View>

                <View className="flex flex-col flex-1 bg-white">
                    <View className="flex flex-row items-start py-2">
                    <Pressable onPress={() => setDetailsOpen(true)} className="flex flex-col items-start justify-start flex-1 gap-2">
                    {/* Header */}
                    <View className="flex flex-row items-center shrink-0 gap-3 px-4 py-1 w-full">
                        <Icon name="goal" size={16} />
                        <View className="flex flex-col items-start justify-center flex-1">
                            <Text
                                className="text-base font-semibold"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {challenge.habitName}
                            </Text>
                            <Text className="text-sm" numberOfLines={1}>
                                {challenge.ownerName}
                            </Text>
                            {challenge.description ? (
                                <Text className="text-sm" numberOfLines={2}>
                                    {challenge.description}
                                </Text>
                            ) : null}
                        </View>
                    </View>

                    <View className="flex flex-row items-center justify-between w-full px-4">
                        <Text style={{ color: getColor('gray-3') }} className="text-sm">
                            {formatDateRelativeToToday(challenge.startsAt)}
                        </Text>
                        <Text style={{ color: getColor('violet') }} className="text-sm font-bold">
                            {`${dollarSigns} · ${7 - challenge.daysOffPerWeek}/7`}
                        </Text>
                    </View>
                    </Pressable>
                    <Pressable
                        onPress={() => setInviteOpen(true)}
                        className="items-center justify-center w-8 h-8 mt-2 mr-3"
                    >
                        <Icon name="share-social" size={20} color="violet" />
                    </Pressable>
                    </View>

                    {/* Footer */}
                    <View className="flex flex-row items-center justify-between w-full gap-2 px-4 pb-2">
                        <Button
                            color={buttonInfo.baseColor}
                            action={buttonInfo.action}
                            className="flex flex-row flex-1 h-10 py-2 rounded-xl"
                        >
                            {buttonInfo.text}
                        </Button>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default React.memo(ChallengeCard);

function getStatusInfo(status: ChallengeToJoin['status']) {
    switch (status) {
        case 'NotStarted':
            return {
                label: 'No aquecimento',
                backgroundColor: getColor('light-orange'),
                textColor: getColor('dark-orange'),
            };

        case 'Running':
            return {
                label: 'Em jogo',
                backgroundColor: getColor('light-success'),
                textColor: getColor('success'),
            };

        case 'Finished':
            return {
                label: 'Missão cumprida',
                backgroundColor: getColor('light-info'),
                textColor: getColor('primary'),
            };

        case 'Cancelled':
            return {
                label: 'Arena fechada',
                backgroundColor: getColor('light-danger'),
                textColor: getColor('danger'),
            };

        default:
            const _exhaustive: never = status;
            return _exhaustive;
    }
}

function getButtonRole(challenge: ChallengeToJoin): ButtonRole {
    switch (challenge.status) {
        case 'Finished':
            return 'peek';

        case 'NotStarted':
            if (challenge.joined) return 'leave';
            return 'join';

        case 'Running':
            if (challenge.joined) return 'leave';
            return 'peek';

        case 'Cancelled':
            throw new Error('Desafio cancelado não entra nessa tela');

        default:
            const _exhaustive: never = challenge.status;
            return _exhaustive;
    }
}

type GetActionOptions = {
    role: ButtonRole;
    challengeId: string;
    userId: string;
    challengeRepository: ReturnType<typeof createChallengeRepository>;
    callback: ChallengeCardProps['callback'];
    navigation: ReturnType<typeof useNavigation>;
}

type ButtonInfo = {
    text: string;
    action: () => Promise<void>,
    baseColor: ColorName,
    lightColor: ColorName
}

function getButtonInfo({ role, challengeId, userId, challengeRepository, callback, navigation }: GetActionOptions): ButtonInfo {
    switch (role) {
        case 'join':
            return {
                text: 'Participar',
                baseColor: 'success',
                lightColor: 'light-success',
                action: async () => {
                    await challengeRepository.join({ challengeId, userId });
                    callback && await callback(challengeId, true);
                },
            };

        case 'leave':
            return {
                text: 'Sair',
                baseColor: 'danger',
                lightColor: 'light-danger',
                action: async () => {
                    await challengeRepository.leave({ challengeId, userId });
                    callback && await callback(challengeId, false);
                },
            };

        case 'peek':
            return {
                text: 'Ver',
                baseColor: 'info',
                lightColor: 'light-info',
                action: async () => {
                    navigation.push(`/challenge-peek?challengeId=${challengeId}`);
                },
            };

        default:
            const _exhaustive: never = role;
            return _exhaustive;
    }
}
