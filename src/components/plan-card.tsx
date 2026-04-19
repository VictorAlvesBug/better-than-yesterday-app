import { ColorName, getColor } from '@/types/color.type'
import { PlanStatus, PlanToJoin } from '@/types/plan.type'
import React, { useState } from 'react'
import { Text, View } from 'react-native'
import Memory from '../api/memory'
import createPlanRepository from '../api/planRepository'
import useEffectAsync from '../hooks/useEffectAsync'
import { formatDateRelativeToToday, formatDateToFront, getDateOnly, getDifferenceInDays } from '../utils/dateUtils'
import { formatIntegerCompact, formatMoney } from '../utils/numberUtils'
import { getAbbreviatedName } from '../utils/stringUtils'
import { toastInfoMessage } from '../utils/toastUtils'
import AmountSelect from './amount-select'
import { Button } from './button'
import Icon from './icon'

type ButtonRole = 'join' | 'leave' | 'peek';

type PlanCardProps = {
    plan: PlanToJoin;
    callback?: (planId: string, joined: boolean) => void;
}

export default function PlanCard({
    plan,
    callback = () => Promise.resolve()
}: PlanCardProps) {
    const planRepository = createPlanRepository();
    const [userId, setUserId] = useState<string>('');

    useEffectAsync(async () => {
        const userId = await Memory.get('userId') || '';
        setUserId(userId);
    }, []);

    const role = getButtonRole(plan);

    const buttonInfo = getButtonInfo({
        role,
        planId: plan.id,
        userId,
        callback,
        planRepository
    });

    return (
        <View className="flex flex-col items-start justify-center w-full gap-2 py-2 pb-4 overflow-hidden bg-white shadow-md rounded-2xl">
            {/* Header */}
            <View className="flex flex-row items-center justify-center flex-1 gap-3 px-4 py-1">
                <Icon name="goal" size={16} />
                <View className='flex flex-col items-start justify-center flex-1'>
                    <Text
                        className="text-base font-semibold"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {plan.habitName}
                    </Text>
                    {
                        plan.description &&
                        <Text
                            className={`text-sm`}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {plan.description}
                        </Text>
                    }
                </View>
                {
                    plan.ownerName &&
                    <Text
                        style={{ backgroundColor: getColor("light-violet"), color: getColor("white") }}
                        className={`px-2 py-0.5 font-bold rounded-full text-xs`}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {getAbbreviatedName(plan.ownerName)}
                    </Text>
                }
            </View>

            <View style={{ backgroundColor: getColor("gray-7"), width: "95%", height: 0.5 }} className="mx-auto"></View>

            {/* Content */}
            <View className='flex flex-col items-start justify-center gap-4 px-6'>
                <View className="flex flex-row items-center justify-between w-full">
                    <View className="flex flex-row items-center justify-center gap-3">
                        <Icon name="calendar-clear-outline" size={14} />
                        <View className='flex flex-col items-start justify-center'>
                            <Text
                                className="text-base font-semibold"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                Início:
                            </Text>
                            <Text
                                className={`text-sm`}
                                numberOfLines={1}
                                ellipsizeMode="tail">
                                {`${formatDateToFront(plan.startsAt)} (${formatDateRelativeToToday(plan.startsAt).toLocaleLowerCase()})`}
                            </Text>
                        </View>
                    </View>

                    <View className='flex flex-col items-start justify-center'>
                        <Text
                            className="text-base font-semibold"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            Duração:
                        </Text>
                        <Text
                            className={`text-sm`}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {getDifferenceInDays(plan.startsAt, plan.endsAt)} dias
                        </Text>
                    </View>
                </View>
                <View className="flex flex-row items-center justify-between w-full">
                    <View className="flex flex-row items-center justify-center gap-3">
                        <Icon name="money" size={14} />
                        <View className='flex flex-col items-start justify-center'>
                            <Text
                                className="text-base font-semibold"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                Penalidade por falha:
                            </Text>
                            <Text
                                className={`text-sm`}
                                numberOfLines={1}
                                ellipsizeMode="tail">
                                {formatMoney(plan.penaltyValue)}
                            </Text>
                        </View>
                    </View>

                    <View className="flex flex-row items-center justify-center gap-1">
                        <Icon name="people" size={16} />
                        <View className='flex flex-col items-start justify-center'>
                            <Text
                                className={`text-sm font-bold`}
                                style={{ color: getColor('gray-7') }}
                                numberOfLines={1}
                                ellipsizeMode="tail">
                                {formatIntegerCompact(plan.memberCount)}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className='flex flex-row'>
                    <AmountSelect
                        value={7 - plan.daysOffPerWeek}
                        minValue={1}
                        maxValue={7}
                        selectedIcon={{
                            type: 'octicons',
                            name: 'check-circle-fill',
                            color: 'gray-7',
                            size: 16
                        }}
                        nonSelectedIcon={{
                            type: 'font-awesome-6',
                            name: 'umbrella-beach',
                            color: 'gray-7',
                            size: 16
                        }}
                        className='flex-1'
                    />
                </View>
            </View>

            {/* Footer */}
            <View className="flex flex-row items-center justify-between w-full gap-2 px-4">
                <Button
                    color={buttonInfo.baseColor}
                    action={buttonInfo.action}
                    className="flex flex-row flex-1 h-10 py-2 rounded-xl">
                    {buttonInfo.text}
                </Button>
            </View>
        </View>
    )
}

function getButtonRole(plan: PlanToJoin): ButtonRole {
    const planStatus = getPlanStatus(plan);

    switch (planStatus) {
        case 'finished':
            return 'peek';

        case 'not-started':
            if (plan.joined)
                return 'leave';
            return 'join'

        case 'running':
            if (plan.joined)
                return 'leave';
            return 'peek'

        case 'cancelled':
            throw new Error('Planos cancelados não devem ser exibidos nessa tela');

        default:
            const _exhaustive: never = planStatus;
            return _exhaustive;
    }
}

function getPlanStatus(plan: PlanToJoin): PlanStatus {
    if (plan.isCancelled)
        return 'cancelled';

    if (getDateOnly() < plan.startsAt)
        return 'not-started';

    if (getDateOnly() < plan.endsAt)
        return 'running';

    return 'finished';
}

type GetActionOptions = {
    role: ButtonRole;
    planId: string;
    userId: string;
    planRepository: ReturnType<typeof createPlanRepository>;
    callback: PlanCardProps['callback'];
}

type ButtonInfo = {
    text: string;
    action: () => Promise<void>,
    baseColor: ColorName,
    lightColor: ColorName
}

function getButtonInfo({ role, planId, userId, planRepository, callback }: GetActionOptions): ButtonInfo {
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
                    await planRepository.leave({planId, userId});
                    callback && await callback(planId, false);
                },
            };

        case 'peek':
            return {
                text: 'Ver',
                baseColor: 'info',
                lightColor: 'light-info',
                action: async () => {
                    toastInfoMessage('TODO: See ranking without join')
                },
            };

        default:
            const _exhaustive: never = role;
            return _exhaustive;
    }
}