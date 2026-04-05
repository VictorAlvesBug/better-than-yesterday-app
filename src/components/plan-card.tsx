import { ColorName, getColor } from '@/types/color.type'
import { PlanStatus, PlanWithHabitToJoin } from '@/types/plan.type'
import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { Text, View } from 'react-native'
import Memory from '../api/memory'
import createPlanRepository from '../api/planRepository'
import useEffectAsync from '../hooks/useEffectAsync'
import { formatDateRelativeToToday, getDateOnly } from '../utils/dateUtils'
import { Button } from './button'

type ButtonRole = 'none' | 'join' | 'abandon' | 'see-ranking';

type PlanCardProps = {
    plan: PlanWithHabitToJoin;
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

    const isAlreadyStarted = plan.startsAt < getDateOnly();
    const startedInOrWillStart = isAlreadyStarted ? 'Iniciado em' : 'Inicia ';
    const planStartInfo = `${startedInOrWillStart} ${formatDateRelativeToToday(plan.startsAt)}`

    const role = getButtonRole(plan);
    const { lightColor, baseColor } = getColors(role);

    let action = getAction({
        role,
        planId: plan.id,
        userId,
        callback,
        planRepository
    });

    return (
        <View className="flex flex-col items-start justify-center w-full gap-2 pb-4 overflow-hidden bg-white shadow-md rounded-2xl">
            <View className="flex flex-col items-start justify-center flex-1 px-4 py-2">
                <View className='flex flex-row items-center justify-between w-full gap-2'>
                    <Text
                        className="flex-1 text-base font-semibold"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {plan.description ? plan.description : plan.habitName}
                    </Text>

                    <Text style={{ backgroundColor: getColor("light-violet"), color: getColor("white") }} className={`px-2 py-1 font-bold rounded-full text-sm`}>
                        {plan.habitName}
                    </Text>
                </View>
                <Text style={{ color: getColor("gray-7") }} className="text-xs" numberOfLines={1}>
                    {planStartInfo}
                </Text>
            </View>

            <Text className="px-6 text-md">{plan.description ?? plan.habitName}</Text>

            <View className="flex flex-row items-center justify-between w-full gap-2 px-4">
                <Button
                    color={lightColor}
                    action={action}
                    className="flex flex-row flex-1 h-auto py-2 rounded-xl">
                    <View className="flex flex-row items-center justify-center w-full gap-2">
                        <Ionicons name="close-outline" size={18} color={getColor(baseColor)} />
                        <Text style={{ color: getColor(baseColor) }} className="font-bold">Abandonar</Text>
                    </View>
                </Button>
            </View>
        </View>
    )
}

function getButtonRole(plan: PlanWithHabitToJoin): ButtonRole {
    const planStatus = getPlanStatus(plan);

    switch (planStatus) {
        case 'Finished':
            return 'see-ranking';

        case 'NotStarted':
            if (plan.joined)
                return 'abandon';
            return 'join'

        case 'Running':
            if (plan.joined)
                return 'abandon';
            return 'see-ranking'

        case 'Cancelled':
        default:
            return 'none';
    }
}

function getPlanStatus(plan: PlanWithHabitToJoin): PlanStatus {
    if (plan.isCancelled)
        return 'Cancelled';

    if (getDateOnly() < plan.startsAt)
        return 'NotStarted';

    if (getDateOnly() < plan.endsAt)
        return 'Running';

    return 'Finished';
}

function getColors(role: ButtonRole): { baseColor: ColorName, lightColor: ColorName } {
    switch (role) {
        case 'join':
            return { baseColor: 'success', lightColor: 'light-success' };

        case 'abandon':
            return { baseColor: 'danger', lightColor: 'light-danger' };

        case 'see-ranking':
            return { baseColor: 'info', lightColor: 'light-info' };

        case 'none':
        default:
            return { baseColor: 'white', lightColor: 'white' };
    }
}

type GetActionOptions = {
    role: ButtonRole;
    planId: string;
    userId: string;
    planRepository: ReturnType<typeof createPlanRepository>;
    callback: PlanCardProps['callback'];
}

function getAction({ role, planId, userId, planRepository, callback }: GetActionOptions) {
    switch (role) {
        case 'join':
            return async () => {
                await planRepository.join(planId, userId);
                callback && await callback(planId, true);
            };

        case 'abandon':
            return async () => {
                await planRepository.abandon(planId, userId);
                callback && await callback(planId, false);
            };

        case 'see-ranking':
            return async () => {
                console.log('TODO: See ranking without join')
            };

        case 'none':
        default:
            return () => Promise.resolve()
    }
}