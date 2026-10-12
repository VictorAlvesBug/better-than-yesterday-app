import { ColorName, getColor } from '@/types/color.type'
import { PlanToJoin } from '@/types/plan.type'
import React, { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import createPlanRepository from '../api/planRepository'
import useNavigation from '../hooks/useNavigation'
import { formatDateRelativeToToday } from '../utils/dateUtils'
import { Button } from './button'
import Icon from './icon'
import PlanDetailsModal from './plan-details-modal'
import InviteLinkModal from './invite-link-modal'

type ButtonRole = 'join' | 'leave' | 'peek';

type PlanCardProps = {
    plan: PlanToJoin;
    userId: string;
    callback?: (planId: string, joined: boolean) => void;
}

function PlanCard({
    plan,
    userId,
    callback = () => Promise.resolve()
}: PlanCardProps) {
    const planRepository = useMemo(() => createPlanRepository(), []);
    const navigation = useNavigation();
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);

    const role = getButtonRole(plan);

    const buttonInfo = getButtonInfo({
        role,
        planId: plan.id,
        userId,
        callback,
        planRepository,
        navigation,
    });

    const statusInfo = getStatusInfo(plan.status);

    const dollarSigns = plan.penaltyValue >= 50 ? '$$$' : plan.penaltyValue >= 10 ? '$$' : '$';

    return (
        <View className="py-2 pb-4 mx-4">
            <PlanDetailsModal plan={detailsOpen ? plan : null} onClose={() => setDetailsOpen(false)} />
            <InviteLinkModal visible={inviteOpen} planId={plan.id} onClose={() => setInviteOpen(false)} />
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
                                {plan.habitName}
                            </Text>
                            <Text className="text-sm" numberOfLines={1}>
                                {plan.ownerName}
                            </Text>
                            {plan.description ? (
                                <Text className="text-sm" numberOfLines={2}>
                                    {plan.description}
                                </Text>
                            ) : null}
                        </View>
                    </View>

                    <View className="flex flex-row items-center justify-between w-full px-4">
                        <Text style={{ color: getColor('gray-3') }} className="text-sm">
                            {formatDateRelativeToToday(plan.startsAt)}
                        </Text>
                        <Text style={{ color: getColor('violet') }} className="text-sm font-bold">
                            {`${dollarSigns} · ${7 - plan.daysOffPerWeek}/7`}
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

export default React.memo(PlanCard);

function getStatusInfo(status: PlanToJoin['status']) {
    switch (status) {
        case 'NotStarted':
            return {
                label: 'Não iniciado',
                backgroundColor: getColor('light-orange'),
                textColor: getColor('dark-orange'),
            };

        case 'Running':
            return {
                label: 'Em andamento',
                backgroundColor: getColor('light-success'),
                textColor: getColor('success'),
            };

        case 'Finished':
            return {
                label: 'Finalizado',
                backgroundColor: getColor('light-info'),
                textColor: getColor('primary'),
            };

        case 'Cancelled':
            return {
                label: 'Cancelado',
                backgroundColor: getColor('light-danger'),
                textColor: getColor('danger'),
            };

        default:
            const _exhaustive: never = status;
            return _exhaustive;
    }
}

function getButtonRole(plan: PlanToJoin): ButtonRole {
    switch (plan.status) {
        case 'Finished':
            return 'peek';

        case 'NotStarted':
            if (plan.joined) return 'leave';
            return 'join';

        case 'Running':
            if (plan.joined) return 'leave';
            return 'peek';

        case 'Cancelled':
            throw new Error('Planos cancelados não devem ser exibidos nessa tela');

        default:
            const _exhaustive: never = plan.status;
            return _exhaustive;
    }
}

type GetActionOptions = {
    role: ButtonRole;
    planId: string;
    userId: string;
    planRepository: ReturnType<typeof createPlanRepository>;
    callback: PlanCardProps['callback'];
    navigation: ReturnType<typeof useNavigation>;
}

type ButtonInfo = {
    text: string;
    action: () => Promise<void>,
    baseColor: ColorName,
    lightColor: ColorName
}

function getButtonInfo({ role, planId, userId, planRepository, callback, navigation }: GetActionOptions): ButtonInfo {
    switch (role) {
        case 'join':
            return {
                text: 'Participar',
                baseColor: 'success',
                lightColor: 'light-success',
                action: async () => {
                    await planRepository.join({ planId, userId });
                    callback && await callback(planId, true);
                },
            };

        case 'leave':
            return {
                text: 'Sair',
                baseColor: 'danger',
                lightColor: 'light-danger',
                action: async () => {
                    await planRepository.leave({ planId, userId });
                    callback && await callback(planId, false);
                },
            };

        case 'peek':
            return {
                text: 'Ver',
                baseColor: 'info',
                lightColor: 'light-info',
                action: async () => {
                    navigation.push(`/plan-peek?planId=${planId}`);
                },
            };

        default:
            const _exhaustive: never = role;
            return _exhaustive;
    }
}
